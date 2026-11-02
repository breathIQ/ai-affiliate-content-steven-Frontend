# Shared affiliate sign-in

Released 2026-11-02 from production base 440374d. CO2Body remains part of the Carbogenetics affiliate program, with no separate commissions or approval plan.

The login page offers shared sign-in through https://carbogenetics.com/affiliate/brands. The affiliate-connect callback exchanges a short-lived, single-use proof-bound grant for a seven-day CO2Body token, only for an existing active sharing-tools account with the same verified email. Shared logout revokes network-issued tokens. Existing CO2Body sign-in remains available.

No PHP backend changes or new frontend secrets are required. Central database migrations and API are maintained in the Carbogenetics repository (db/affiliate_network.sql and db/affiliate_network_co2body.sql).

Verified: production build, real browser login into the CO2Body dashboard, backend token acceptance and shared logout revocation, wrong-brand and replay rejection. Disposable test accounts are removed after verification.

Production deployment: dpl_CmC4NrU5koFpzwSMRTJW2npDytza. Unrelated unpublished avatar-picker work was excluded from this release.
