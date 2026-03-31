"use client";

import { useState, useCallback } from "react";
import { useBotContext } from "@/components/dashboard/BotContext";
import { trpc } from "@/lib/trpc";

const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID || "";

type Platform = "telegram" | "instagram" | "messenger" | "whatsapp";

interface ConnectModalState {
  open: boolean;
  step: "idle" | "loading" | "select_page" | "success" | "error";
  pages: Array<{
    pageId: string;
    pageName: string;
    hasInstagram: boolean;
    instagramAccountId: string | null;
  }>;
  selectedPageId: string | null;
  connectInstagram: boolean;
  connectMessenger: boolean;
  error: string | null;
  result: { instagram: boolean; messenger: boolean; pageName: string } | null;
}

export default function PlatformsPage() {
  const { currentBotId, isDemo } = useBotContext();
  const [modal, setModal] = useState<ConnectModalState>({
    open: false,
    step: "idle",
    pages: [],
    selectedPageId: null,
    connectInstagram: true,
    connectMessenger: true,
    error: null,
    result: null,
  });
  const [disconnecting, setDisconnecting] = useState<Platform | null>(null);

  const statusQuery = trpc.platform.getStatus.useQuery(
    { botId: currentBotId! },
    { enabled: !!currentBotId && !isDemo }
  );

  const connectMetaMutation = trpc.platform.connectMeta.useMutation({
    onSuccess: (data) => {
      setModal((m) => ({
        ...m,
        step: "success",
        result: {
          instagram: data.instagram,
          messenger: data.messenger,
          pageName: data.pageName ?? "",
        },
      }));
      statusQuery.refetch();
    },
    onError: (err) => {
      setModal((m) => ({ ...m, step: "error", error: err.message }));
    },
  });

  const getMetaPagesMutation = trpc.platform.getMetaPages.useMutation();

  const disconnectMutation = trpc.platform.disconnect.useMutation({
    onSuccess: () => {
      setDisconnecting(null);
      statusQuery.refetch();
    },
  });

  const status = statusQuery.data;

  // ─── Facebook Login SDK ────────────────────────────────────────────────────
  const handleMetaLogin = useCallback(() => {
    if (!META_APP_ID) {
      setModal((m) => ({
        ...m,
        open: true,
        step: "error",
        error: "Meta App ID \u043D\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043D. \u041E\u0431\u0440\u0430\u0442\u0438\u0442\u0435\u0441\u044C \u043A \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0443.",
      }));
      return;
    }

    setModal((m) => ({ ...m, open: true, step: "loading" }));

    // Load Facebook SDK dynamically
    const FB = (window as unknown as Record<string, unknown>).FB as {
      login: (
        cb: (response: {
          authResponse?: { accessToken: string };
          status: string;
        }) => void,
        opts: { scope: string; auth_type?: string }
      ) => void;
    } | undefined;

    if (!FB) {
      // Initialize Facebook SDK
      const script = document.createElement("script");
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        const fbInit = (window as unknown as Record<string, unknown>).FB as {
          init: (opts: Record<string, unknown>) => void;
          login: typeof FB extends { login: infer L } ? L : never;
        };
        fbInit.init({
          appId: META_APP_ID,
          cookie: true,
          xfbml: false,
          version: "v21.0",
        });
        doFBLogin();
      };
      document.body.appendChild(script);
    } else {
      doFBLogin();
    }
  }, []);

  function doFBLogin() {
    const FB = (window as unknown as Record<string, unknown>).FB as {
      login: (
        cb: (response: {
          authResponse?: { accessToken: string };
          status: string;
        }) => void,
        opts: { scope: string }
      ) => void;
    };

    FB.login(
      (response) => {
        if (response.authResponse?.accessToken) {
          fetchPages(response.authResponse.accessToken);
        } else {
          setModal((m) => ({
            ...m,
            step: "error",
            error: "\u0412\u0445\u043E\u0434 \u0447\u0435\u0440\u0435\u0437 Facebook \u043E\u0442\u043C\u0435\u043D\u0451\u043D.",
          }));
        }
      },
      {
        scope:
          "pages_messaging,pages_manage_metadata,instagram_manage_messages,instagram_basic",
      }
    );
  }

  async function fetchPages(accessToken: string) {
    try {
      const result = await getMetaPagesMutation.mutateAsync({ accessToken });
      setModal((m) => ({
        ...m,
        step: "select_page",
        pages: result.pages,
        selectedPageId: result.pages[0]?.pageId ?? null,
      }));
    } catch (err) {
      setModal((m) => ({
        ...m,
        step: "error",
        error: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u0441\u043F\u0438\u0441\u043E\u043A \u0441\u0442\u0440\u0430\u043D\u0438\u0446.",
      }));
    }
  }

  function handleConnect() {
    if (!modal.selectedPageId || !currentBotId) return;
    const token = getMetaPagesMutation.data?.longLivedToken;
    if (!token) return;

    connectMetaMutation.mutate({
      botId: currentBotId,
      accessToken: token,
      selectedPageId: modal.selectedPageId,
      connectInstagram: modal.connectInstagram,
      connectMessenger: modal.connectMessenger,
    });
  }

  function handleDisconnect(platform: Exclude<Platform, "telegram">) {
    if (!currentBotId) return;
    setDisconnecting(platform);
    disconnectMutation.mutate({ botId: currentBotId, platform });
  }

  function closeModal() {
    setModal({
      open: false,
      step: "idle",
      pages: [],
      selectedPageId: null,
      connectInstagram: true,
      connectMessenger: true,
      error: null,
      result: null,
    });
  }

  const platforms = [
    {
      id: "telegram" as Platform,
      name: "Telegram",
      icon: "\u2708\uFE0F",
      color: "bg-blue-500",
      description: "\u0421\u0430\u043C\u0430\u044F \u043F\u043E\u043F\u0443\u043B\u044F\u0440\u043D\u0430\u044F \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430 \u0432 \u0423\u0437\u0431\u0435\u043A\u0438\u0441\u0442\u0430\u043D\u0435",
      connected: status?.telegram.connected ?? false,
      detail: status?.telegram.name ? `@${status.telegram.name}` : null,
      canDisconnect: false,
    },
    {
      id: "instagram" as Platform,
      name: "Instagram",
      icon: "\uD83D\uDCF7",
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
      description: "Direct \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u0438 \u043A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0438",
      connected: status?.instagram.connected ?? false,
      detail: status?.instagram.accountId ?? null,
      canDisconnect: true,
    },
    {
      id: "messenger" as Platform,
      name: "Messenger",
      icon: "\uD83D\uDCAC",
      color: "bg-blue-600",
      description: "Facebook Messenger \u0434\u043B\u044F \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B",
      connected: status?.messenger.connected ?? false,
      detail: status?.messenger.pageName ?? null,
      canDisconnect: true,
    },
    {
      id: "whatsapp" as Platform,
      name: "WhatsApp",
      icon: "\uD83D\uDCF1",
      color: "bg-green-500",
      description: "WhatsApp Business API",
      connected: status?.whatsapp.connected ?? false,
      detail: status?.whatsapp.phoneNumber ?? null,
      canDisconnect: true,
    },
  ];

  const connectedCount = platforms.filter((p) => p.connected).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {"\u041F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u044B"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {"\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u043C\u0435\u0441\u0441\u0435\u043D\u0434\u0436\u0435\u0440\u044B \u0434\u043B\u044F \u0432\u0430\u0448\u0435\u0433\u043E \u0431\u043E\u0442\u0430 \u2022 "}
          {connectedCount}{" "}
          {"\u0438\u0437 4 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u043E"}
        </p>
      </div>

      {/* Quick connect banner */}
      {connectedCount < 4 && (
        <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 p-5">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
              {"\uD83D\uDD17"}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                {"\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u0435 Instagram \u0438 Messenger \u043E\u0434\u043D\u0438\u043C \u043A\u043B\u0438\u043A\u043E\u043C"}
              </p>
              <p className="text-sm text-gray-600 mt-0.5">
                {"\u0412\u043E\u0439\u0434\u0438\u0442\u0435 \u0447\u0435\u0440\u0435\u0437 Facebook \u0438 \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443"}
              </p>
            </div>
            <button
              onClick={handleMetaLogin}
              className="rounded-xl bg-[#1877F2] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#166FE5] transition-colors"
            >
              {"\u0412\u043E\u0439\u0442\u0438 \u0447\u0435\u0440\u0435\u0437 Facebook"}
            </button>
          </div>
        </div>
      )}

      {/* Platform cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {platforms.map((platform) => (
          <div
            key={platform.id}
            className={`rounded-2xl border-2 p-6 transition-all ${
              platform.connected
                ? "border-green-200 bg-green-50/30"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-xl ${platform.color} flex items-center justify-center text-2xl text-white`}
              >
                {platform.icon}
              </div>
              {platform.connected ? (
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  {"\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D"}
                </span>
              ) : (
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                  {"\u041D\u0435 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D"}
                </span>
              )}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {platform.name}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {platform.description}
            </p>

            {platform.connected && platform.detail && (
              <div className="mb-4 rounded-lg bg-white border border-green-200 p-3">
                <p className="text-xs text-gray-500 mb-1">
                  {platform.id === "telegram"
                    ? "Bot username"
                    : platform.id === "whatsapp"
                    ? "\u041D\u043E\u043C\u0435\u0440"
                    : "\u0410\u043A\u043A\u0430\u0443\u043D\u0442"}
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {platform.detail}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              {!platform.connected && platform.id === "telegram" && (
                <button className="flex-1 rounded-xl bg-[#3B82F6] py-2.5 text-sm font-medium text-white hover:bg-[#2563EB] transition-colors">
                  {"\u041D\u0430\u0441\u0442\u0440\u043E\u0438\u0442\u044C"}
                </button>
              )}
              {!platform.connected &&
                (platform.id === "instagram" ||
                  platform.id === "messenger") && (
                  <button
                    onClick={handleMetaLogin}
                    className="flex-1 rounded-xl bg-[#1877F2] py-2.5 text-sm font-medium text-white hover:bg-[#166FE5] transition-colors"
                  >
                    {"\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u044C"}
                  </button>
                )}
              {!platform.connected && platform.id === "whatsapp" && (
                <button
                  onClick={handleMetaLogin}
                  className="flex-1 rounded-xl bg-[#25D366] py-2.5 text-sm font-medium text-white hover:bg-[#20BD5A] transition-colors"
                >
                  {"\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u044C"}
                </button>
              )}
              {platform.connected && (
                <button className="flex-1 rounded-xl border-2 border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  {"\u041D\u0430\u0441\u0442\u0440\u043E\u0438\u0442\u044C"}
                </button>
              )}
              {platform.connected && platform.canDisconnect && (
                <button
                  onClick={() => handleDisconnect(platform.id as Exclude<Platform, "telegram">)}
                  disabled={disconnecting === platform.id}
                  className="rounded-xl border-2 border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {disconnecting === platform.id
                    ? "..."
                    : "\u0423\u0434\u0430\u043B\u0438\u0442\u044C"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Connection Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            {/* Loading */}
            {modal.step === "loading" && (
              <div className="text-center py-8">
                <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-600">
                  {"\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u043A Facebook..."}
                </p>
              </div>
            )}

            {/* Page Selection */}
            {modal.step === "select_page" && (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {"\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443"}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  {"\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 Facebook \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443 \u0438 \u043A\u0430\u043D\u0430\u043B\u044B \u0434\u043B\u044F \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F"}
                </p>

                {modal.pages.length === 0 ? (
                  <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 mb-4">
                    <p className="text-sm text-yellow-800">
                      {"\u041D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E Facebook \u0441\u0442\u0440\u0430\u043D\u0438\u0446. \u0421\u043E\u0437\u0434\u0430\u0439\u0442\u0435 Facebook Page \u0434\u043B\u044F \u0432\u0430\u0448\u0435\u0433\u043E \u0431\u0438\u0437\u043D\u0435\u0441\u0430."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 mb-4">
                    {modal.pages.map((page) => (
                      <label
                        key={page.pageId}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          modal.selectedPageId === page.pageId
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="page"
                          checked={modal.selectedPageId === page.pageId}
                          onChange={() =>
                            setModal((m) => ({
                              ...m,
                              selectedPageId: page.pageId,
                            }))
                          }
                          className="accent-blue-500"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {page.pageName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {page.hasInstagram
                              ? "\u2705 Instagram \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0451\u043D"
                              : "\u26A0\uFE0F Instagram \u043D\u0435 \u043F\u0440\u0438\u0432\u044F\u0437\u0430\u043D"}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* Channel toggles */}
                <div className="space-y-2 mb-6">
                  <p className="text-sm font-medium text-gray-700">
                    {"\u041A\u0430\u043D\u0430\u043B\u044B:"}
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modal.connectInstagram}
                      onChange={(e) =>
                        setModal((m) => ({
                          ...m,
                          connectInstagram: e.target.checked,
                        }))
                      }
                      className="accent-pink-500 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">
                      {"\uD83D\uDCF7 Instagram Direct"}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modal.connectMessenger}
                      onChange={(e) =>
                        setModal((m) => ({
                          ...m,
                          connectMessenger: e.target.checked,
                        }))
                      }
                      className="accent-blue-500 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">
                      {"\uD83D\uDCAC Facebook Messenger"}
                    </span>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 rounded-xl border-2 border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {"\u041E\u0442\u043C\u0435\u043D\u0430"}
                  </button>
                  <button
                    onClick={handleConnect}
                    disabled={
                      !modal.selectedPageId ||
                      connectMetaMutation.isPending ||
                      (!modal.connectInstagram && !modal.connectMessenger)
                    }
                    className="flex-1 rounded-xl bg-[#1877F2] py-2.5 text-sm font-medium text-white hover:bg-[#166FE5] disabled:opacity-50 transition-colors"
                  >
                    {connectMetaMutation.isPending
                      ? "\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435..."
                      : "\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u044C"}
                  </button>
                </div>
              </>
            )}

            {/* Success */}
            {modal.step === "success" && modal.result && (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl mx-auto mb-4">
                  {"\u2705"}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {"\u0423\u0441\u043F\u0435\u0448\u043D\u043E!"}
                </h2>
                <p className="text-gray-600 mb-1">{modal.result.pageName}</p>
                <div className="flex items-center justify-center gap-3 mb-6">
                  {modal.result.instagram && (
                    <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-700">
                      Instagram
                    </span>
                  )}
                  {modal.result.messenger && (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                      Messenger
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  {"\u0411\u043E\u0442 \u043D\u0430\u0447\u043D\u0451\u0442 \u043E\u0442\u0432\u0435\u0447\u0430\u0442\u044C \u043D\u0430 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438."}
                </p>
                <button
                  onClick={closeModal}
                  className="w-full rounded-xl bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
                >
                  {"\u0413\u043E\u0442\u043E\u0432\u043E"}
                </button>
              </div>
            )}

            {/* Error */}
            {modal.step === "error" && (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-3xl mx-auto mb-4">
                  {"\u274C"}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {"\u041E\u0448\u0438\u0431\u043A\u0430"}
                </h2>
                <p className="text-sm text-red-600 mb-6">{modal.error}</p>
                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 rounded-xl border-2 border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {"\u0417\u0430\u043A\u0440\u044B\u0442\u044C"}
                  </button>
                  <button
                    onClick={handleMetaLogin}
                    className="flex-1 rounded-xl bg-[#1877F2] py-2.5 text-sm font-medium text-white hover:bg-[#166FE5] transition-colors"
                  >
                    {"\u041F\u043E\u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C \u0441\u043D\u043E\u0432\u0430"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
