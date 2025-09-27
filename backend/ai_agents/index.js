// Entry point to run all AI agents (for cron or manual trigger)
const { runMatchingAgent } = require('./matchingAgent');
const { runMarketingAgent } = require('./marketingAgent');
const { runInvoicingAgent } = require('./invoicingAgent');
const { runLegalAgent } = require('./legalAgent');
const { runPaymentAgent } = require('./paymentAgent');
const { runSupportAgent } = require('./supportAgent');

async function runAllAgents() {
  await runMatchingAgent();
  await runMarketingAgent();
  await runInvoicingAgent();
  await runLegalAgent();
  await runPaymentAgent();
  await runSupportAgent();
}

module.exports = { runAllAgents };
