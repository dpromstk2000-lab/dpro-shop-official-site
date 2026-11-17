// DPRO ORDER | production API connected, operations LOCKED pending acceptance.
// Verified Worker: GET /healthz, readEnabled:true, writeEnabled:false on 2026-11-17.
// NEVER enable writes before production tenant, login and order lifecycle acceptance.
export const ORDER_API_BASE = "https://dpro-order-api.dpromstk2000.workers.dev";
export const ORDER_QA_WRITE_TEST_MODE = false;
export const ORDER_PRODUCTION_LIVE = false;
