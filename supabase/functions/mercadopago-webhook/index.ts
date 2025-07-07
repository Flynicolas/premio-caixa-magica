// mercadopago-webhook/index.ts — versão completa com crédito na carteira
// --------------------------------------------------------------
// 1. Recebe notificações de pagamento (Mercado Pago)
// 2. Busca detalhes completos da transação
// 3. Quando status === "approved", credita o saldo na tabela `wallets`
// 4. Em seguida chama a RPC `process_mercadopago_webhook` (para logs, histórico, etc.)
// --------------------------------------------------------------

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS básico para qualquer origem
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Pré‑flight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Supabase client (service role) -------------------------
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Aceita apenas POST
    if (req.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers: corsHeaders,
      });
    }

    const body = await req.json();
    console.log("Webhook recebido:", JSON.stringify(body));

    // Mercado Pago envia vários tipos. Queremos apenas payment.
    if (body.type !== "payment") {
      return new Response("Ignored event", { status: 200, headers: corsHeaders });
    }

    const paymentId: string | undefined = body.data?.id;
    if (!paymentId) {
      console.error("Payment ID não encontrado no webhook");
      return new Response("Payment ID missing", {
        status: 400,
        headers: corsHeaders,
      });
    }

    // --- Buscar detalhes do pagamento no MP ---------------------
    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!accessToken) {
      console.error("Access token do Mercado Pago não configurado");
      return new Response("Configuration error", {
        status: 500,
        headers: corsHeaders,
      });
    }

    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!paymentResponse.ok) {
      console.error(
        "Erro ao buscar pagamento no Mercado Pago:",
        paymentResponse.status
      );
      return new Response("Payment fetch error", {
        status: 500,
        headers: corsHeaders,
      });
    }

    const paymentData: any = await paymentResponse.json();
    console.log("Dados do pagamento:", JSON.stringify(paymentData));

    // external_reference ou preference_id usado para rastrear o pedido
    const preferenceId: string | undefined =
      paymentData.external_reference || paymentData.metadata?.preference_id;

    if (!preferenceId) {
      console.error("Preference ID não encontrado nos dados do pagamento");
      return new Response("Preference ID missing", {
        status: 400,
        headers: corsHeaders,
      });
    }

    // ------------------------------------------------------------
    // 1️⃣ Crédito na carteira se status === "approved"
    // ------------------------------------------------------------
    if (paymentData.status === "approved") {
      // 🛈 Você deve enviar user_id no metadata quando criar o pagamento
      const userId: string | undefined = paymentData.metadata?.user_id;
      const amount: number = Number(paymentData.transaction_amount ?? 0);

      if (!userId) {
        console.error("user_id não informado no metadata do pagamento");
      } else if (amount <= 0) {
        console.error("Valor do pagamento inválido:", amount);
      } else {
        // Busca saldo atual e faz o UPDATE incremental
        const { data: walletRow, error: walletFetchErr } = await supabase
          .from("wallets")
          .select("balance")
          .eq("user_id", userId)
          .single();

        if (walletFetchErr) {
          console.error("Erro ao buscar carteira:", walletFetchErr);
        } else {
          const newBalance = Number(walletRow?.balance ?? 0) + amount;
          const { error: walletUpdateErr } = await supabase
            .from("wallets")
            .update({ balance: newBalance })
            .eq("user_id", userId);

          if (walletUpdateErr) {
            console.error("Erro ao creditar carteira:", walletUpdateErr);
          } else {
            console.log(
              `Carteira de ${userId} creditada com ${amount}. Novo saldo: ${newBalance}`
            );
          }
        }
      }
    } else {
      console.log("Pagamento não aprovado (status:", paymentData.status, ")");
    }

    // ------------------------------------------------------------
    // 2️⃣ Chama RPC para log / outras regras de negócio
    // ------------------------------------------------------------
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "process_mercadopago_webhook",
      {
        p_preference_id: preferenceId,
        p_payment_id: paymentId.toString(),
        p_payment_status: paymentData.status,
        p_webhook_data: paymentData,
      }
    );

    if (rpcError) {
      console.error("Erro ao executar RPC:", rpcError);
      return new Response("Processing error", {
        status: 500,
        headers: corsHeaders,
      });
    }

    console.log("Webhook processado com sucesso:", rpcResult);
    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("Erro no webhook:", err);
    return new Response("Internal error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
