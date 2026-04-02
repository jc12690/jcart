## Field Descriptions

| Field | Description |
|-------|-------------|
| `IP` | Source IP address of the request (IPv4 or IPv6). |
| `URL` | Full URL of the page visited on shopnova.com. |
| `ASN` | Autonomous System Name — the ISP or hosting provider that owns the source IP. Data-centre ASNs (e.g. cloud/VPS providers) can indicate non-human traffic. |
| `Useragent` | Browser / client User-Agent string. Can be spoofed. |
| `ip_timezone` | Timezone inferred from the IP's geolocation. |
| `device_timezone` | Timezone reported by the client device's JavaScript runtime. A mismatch with `ip_timezone` may indicate location spoofing. |
| `utm_source` | Marketing attribution source (google, bing, linkedin, etc.). |
| `utm_campaign` | Marketing attribution campaign name. |
| `gclid` | Google click ID — present only on paid Google traffic. |
| `msclkid` | Microsoft (Bing) click ID — present only on paid Bing traffic. |
| `threat_group` | High-level classification: `Invalid Bot Activity`, `Invalid Suspicious Activity`, `Invalid Malicious Activity`, or NULL (for valid traffic) |
| `threat_type` | Specific signal examples include `Malicious Bot`, `Automation tool`, `Like Headless`, `VPN`, `Multi Suspicious Signals`, and other suspicious-behavior labels from upstream telemetry. |
| `timestamp` | UTC timestamp of the request. |
| `device_type` | Device category derived from the User-Agent: `desktop`, `mobile`, `tablet`. |
| `device_environment` | Execution environment reported by the client: `DESKTOP`, `MOBILE_WEB`, `IN_APP`. A mismatch with `device_type` / `Useragent` may indicate environment spoofing. |
| `hardware_concurrency` | Number of logical CPU cores reported by the browser. Consumer devices typically report 4–16. Data-centre machines may report 128 or 256. |
| `first_interaction_time` | Milliseconds between page load and the user's first interaction (click, scroll, keystroke). Humans typically range from 800–4000 ms. |
| `canvas_fp` | Canvas fingerprint — a hash derived from the device's graphics rendering pipeline. Each unique device should produce a unique hash. Shared values across many sessions suggest shared infrastructure. |
| `city` | City derived from IP geolocation. |
| `state` | State / province derived from IP geolocation. |
| `event_payload_asyncData_batteryApi` | Battery API JSON for Android devices. Extract level with `batteryApi, 'level')` and charging status with `batteryApi, 'charging')`. This field is expected to be null for non-Android traffic. |
| `reason_codes` | Pipe-delimited detection signals: `TZ_MISMATCH`, `DC_ASN`, `HEADLESS_BROWSER`, `AUTOMATION_TOOL`, `MALICIOUS_BOT`, `VPN_DETECTED`, `DATACENTER_HARDWARE`, `INHUMAN_SPEED`. |


********************************************************************************************************************************************

## Executive Summary

#### Key Findings
Automated traffic originating from data center infrastructure accounts for **25.51%** of all ShopNova sessions targeting checkout and login endpoints.

#### Situation
An enterprise customer **ShopNova** (`shopnova.com`), has reported *suspicious activity* on their website. They have observed anomalous traffic patterns around their checkout flow and are concerned about **account takeovers** and **inventory hoarding** during a recent product launch.

#### Context 
Analysis of traffic to ShopNova's website identified a coordinated automated traffic campaign responsible for **25.51%** of all sessions in the accompanying dataset. All sessions include clear indications of automation such as inhuman interaction speeds (< 100ms), repeated device fingerprints, hardware signatures aligned with those of datacenters, and detection signals such as **AUTOMATION_TOOL**, **MALICIOUS_BOT**, and **INHUMAN_SPEED** among others. The majority of the suspicious traffic identified originates from datacenter infrastructure providers **AS-CHOOPA**, **AS-BLAZINGSEO**, and **AMAZON-02**, which are commonly used to automate traffic at scale.

#### Evidence
Behavioral analysis indicates that requests are targeting critical endpoints such as `/checkout`, `/browse`, `/login`, and product-specific detail pages. This behavior is consistent with inventory hoarding practices and credential stuffing attempts, which disrupt legitimate consumer purchases and has the potential to expose user account information to unauthorized parties.

#### Business Impact
Bot activity has the potential to block legitimate users from purchasing products, damage site reputation, and expose customer data, all of which reduce consumer trust and create frustration among users who wish to make legitimate purchases. Automated sessions were found to be interacting with paid advertising campaigns for cost-per-clicks with Google and Bing, representing an estimated loss of $\$$3,362 - $\$$13,448 in advertising spending during the analysis period alone.

#### Action Items
To prevent lost revenue, account credential leaking, negative customer experience, and damage to the site's reputation, CHEQ recommends prioritizing the following mitigation efforts:
1. Block data center ASNs from advertising traffic
2. Rate limit checkouts
3. Block canvas fingerprints mapped to the aforementioned infrastructure providers
4. Require multi-factor authentication methods to challenge suspicious authentications
5. Deploy credential stuffing detection for the `/login` endpoint
6. Flag hardware concurrencies ≥ 128, which is common for data center operations
7. Deploy VPN detection for mismatching between a session's expected timezone versus actual geolocation

## Technical Indicators

### Considerations and Correlations

There are six specific things that must be cross-referenced to properly distinguish (automated) bot activity from legitimate user activity.

#### Primary Considerations

1. **ASN**: ASNs can be telling if the number of traffic requests is particularly high from any of them, especially if used in conjunction with interaction timing and device fingerprinting. These variables will be cross-referenced throughout the report, among others.
2. **Interaction Timing**: `first_interaction_time` allows analysts to create a baseline understanding of what is typical human behavior, potential suspicious browsing activity, and high-confidence bot activity.
3. **Endpoint Requests**: The pages being requested can reveal information about credential stuffing, account takeovers, and inventory hoarding. The number of requests to each page from the same ASN is highly indicative of automated requests and should be carefully examined.
4. **Timzezone Mismatching**: `ip_timezone` should be equivalent to `device_timezone`, as timezone and browser timezone and language should all coincide with the region/locale. There are times when these will be mismatched and unrelated to suspicious activity.
5. **User Agents and Device Fingerprinting**: User agents can be spoofed, but it is significantly more difficult to spoof a device fingerprint. Asynchronous user agents and fingerprints suggest malicious activity.

#### Secondary Considerations

These may still be worth looking into, but will not be weighted as much as items 1-5 for the purposes of this report. In some cases, these lesser-considered variables can be used to quantify business impact later on in the investigation.

6. **Device Type**: `device_type` should be cross-referenced with `Useragent`, as it's possible for the information that correlates with one another to be out of sync with what is being spoofed.
7. **batteryApi**: If a device is "charging," it could be a laptop, but it could also be a mobile device.
8. **Timing**: `timestamp` will tell us how many requests are sent during off-hours.
9. **Paid Clicks**: Counting totals from `gclid` and `msclkid` will allow for an estimate of how much money is being wasted on ingenuine traffic.
   
#### Baseline Interaction Time Establishment

Averages and counts were used to select indicators of unusual activity, with the primary considerations defined above being cross-referenced and selected in conjunction with one another to find correlations, e.g., `ASN` and `first_interaction_time` versus the two as individual pieces of data. The following will was used for benchmarking normal and suspicious behaviors with respect to the `first_interaction_time` variable:


| First Interaction Time (ms) | Interpretation |
|-------|-------------|
| 800 - 4000 | Typical human range |
| 100 - 799 | Fast, suspicious behavior |
| 0 - 99 | Automation; impossible human behavior |

### Mismatched Hardware Combinations

**AS-CHOOPA**, **AS-BLAZINGSEO**, and **AMAZON-02** are already showing signs of bot activity. We can verify this further by taking a look at hardware configuration mismatches, as spoofing OS versions leaves room for error in making sure that the hardware and device types are in sync with the OS version spoofed. Hardware concurrency will need to be taken into account, as data center operations usually range from 128 - 256 CPU cores.

```sql
SELECT ASN, canvas_fp, hardware_concurrency, COUNT(*) AS count FROM traffic WHERE canvas_fp IN ('a3f9d21c', 'b7e4c920', 'f1d3e85a') AND hardware_concurrency >= 128 GROUP BY ASN, canvas_fp, hardware_concurrency DESC
```

| ASN | Device Fingerprint | CPU Cores | Total Sessions |
|-------|-------------|------|------|
| AS-CHOOPA | a3f9d21c | 256 | 6,663 |
| AS-BLAZINGSEO | b7e4c920 | 256 | 5,753 |
| AS-CHOOPA | a3f9d21c | 128 | 2,898 |
| AS-BLAZINGSEO | b7e4c920 | 128 | 2,490 |
| AMAZON-02	| f1d3e85a | 256 | 2092 |
| AMAZON-02 | f1d3e85a | 128 | 932 |

From this query, we can see that the CPU cores align with that which is expected from a data center. These results strongly correlate bot activity with the identified ASNs, and this can be explored futher with more fingerprinting, reason codes, and threat types.

In total, there are 20,828 sessions - 16.40% of the dataset - with reused fingerprints and CPU cores that far exceed that of the typical user, thus allowing us to see, with high confidence, that automated bot farms are associated with these ASNs and fingerprints.

### Interaction Times

```sql
SELECT ASN, Useragent, avg(first_interaction_time), count() FROM traffic WHERE first_interaction_time < 800 GROUP BY ASN, Useragent ORDER BY count() DESC LIMIT 10
```

The above SQL query allows users to view, in descending order, all first interaction times less than 800 ms and how many times this number occurs within the data. In total, 1,371 rows were returned after filtering via SQL querying. We notice here that there are 7,361 Windows NT agents with an average interaction time of 86.877191. Adding "ASN" to the query above yields two suspicious results. Findings for this are as follows:

1. 2,529 requests with an average interaction time of 1.459 ms comes from ASN *AS-CHOOPA*.
2. 2,299 requests with an average interaction time of 1.503 ms comes from ASN *AMAZON-02*.

Bots typically use cloud server infrastructure among others, hence, this is suspicious. The logical next step is to find what percentage of traffic is coming from these specific ASNs, and this will be examined in more detail further in the investigative report.

### Timezone Mismatching

Timezone mismatching is a useful signal for identifying malicious traffic, although it must be considered in conjunction with other variables. Starting with this, a mismatch can indicate spoofing, VPN usage, or automated web browsing. When coupled with `reason_codes`, the data returned from the following SQL query show that the majority of timezone mismatches originate from a few specific ASNs. Counts under 1,000 were excluded for clarity.

```sql
SELECT ASN, count() FROM traffic WHERE reason_codes LIKE '%TZ_MISMATCH%' GROUP BY ASN ORDER BY count() DESC LIMIT 20
```

| ASN | Total Number of Timezone Mismatches |
|-------|-------------|
| AS-CHOOPA | 9,559 |
| AS-BLAZINGSEO | 8,243 |
| Reliance Jio Infocomm Limited | 6,289 |
| Bharti Airtel Ltd., Telemedia Services | 4,106 |
| AMAZON-02 | 3,023 |
| Philippine Long Distance Telephone Company | 1,626 |
| CENTURYLINK-US-LEGACY-QWEST | 1,609 |

Several ASNs listed in the table above (Reliance Jio Infocomm Limited, Bharti Airtel Ltd., Philippine Long Distance Telephone Company, and CENTURYLINK-US-LEGACY-QWEST) represent large, well-established consumer ISPs. Traffic from these networks may represent legitimate users or traffic routed through proxy networks. The presence of mismatches from **AS-CHOOPA**, **AS-BLAZINGSEO**, and **AMAZON-02** are associated with cloud hosting services, which is a common tactic among automated traffic; ergo, these ASNs warrant further investigation in combination with other the variables listed above.


### User Agents & Device Fingerprinting

To identify all rows in the dataset in which the human interaction time, the following query was used.
```sql
SELECT Useragent, device_type, device_environment, count() FROM traffic WHERE Useragent LIKE '%Linux%' AND device_type LIKE '%mobile%' GROUP BY Useragent, device_type, device_environment ORDER BY count() DESC
```
6,479 rows were returned. One row in particular has 6,000+ entries with the same specs, and it is possible that this is a red flag, as there should be more variation in device, OS, and version builds. If we alter the query to include the average of the first interaction time, we notice that all of the average interaction times are within the 800ms - 4000ms range.

```sql
SELECT ASN, canvas_fp, count() FROM traffic GROUP BY ASN, canvas_fp ORDER BY count() DESC
```
The query above returns the ASN, device fingerprint used, and the number of times it was used in each specific ASN. This results in the following information, from which we deduce that bot services exist due to the same `canvas_fp` value being returned almost 10,000 times from ASN **AS-CHOOPA**. 

| ASN | Device Fingerprint | Fingerprint Usage Count |
|-------|-------------|------|
| AS-CHOOPA | a3f9d21c | 9,561 |
| AS-BLAZINGSEO | b7e4c920 | 8,243 |
| AMAZON-02 | f1d3e85a | 3,024 |
| CENTURYLINK-US-LEGACY-QWEST | c9a2b147 | 1,604 |
| Philippine Long Distance Telephone Company | c9a2b147 | 792 |


Note here that the device fingerprint **c9a2b147** appears in two different ASNs. This is indicative of two things:
1. A distributed botnet using similar automation configurations, or
2. A proxy or VPN service that reuses fingerprints across ISPs.

Either of these is possible, however, given the interaction time and count from the three ASNs singled out above, we can say with high confidence that those are the ones that deserve the most investigation, followed by traffic from ISPs.

### ASNs, Reason Codes, & Threat Types
Following from the above information we gained from `first_interaction_time`, we should run a query to find out how much traffic from these specific ASNs is underneath the threshold for human activity as described in *Field Descriptions* above. 

From our discovery using `first_interaction_time`, it can be inferred that these specific ASNs are malicious. Having used `reason_codes` to confirm, we know that all of these specific ASNs align with a datacenter and use datacenter hardware. Based on this information, we can see that this dataset contains automated traffic that originates from datacenters using datacenter hardware, headless browsers, and VPNs. Adding `threat_type` to the query reveals that there is suspected location spoofing and VPN usage, which aligns with the timezone mismatching that is present with the devices with different IP locations versus physical locations and vice-versa:

```sql
SELECT ASN, reason_codes, threat_type, count() FROM traffic WHERE first_interaction_time < 100 AND reason_codes LIKE '%INHUMAN_SPEED%' GROUP BY ASN, reason_codes, threat_type ORDER BY count() DESC
```

| ASN | Total Requests | Reason Code(s) | Threat Type |
|-------|-------------|-------|-------|
| AS-BLAZINGSEO | 5,817 | TZ_MISMATCH, DC_ASN, MALICIOUS_BOT, DATACENTER_HARDWARE, INHUMAN_SPEED | Malicious Bot |
| AS-CHOOPA | 5,185 | TZ_MISMATCH, DC_ASN, MALICIOUS_BOT, DATACENTER_HARDWARE, INHUMAN_SPEED | Automation Tool |
| AS-CHOOPA | 3,933 | TZ_MISMATCH, DC_ASN, MALICIOUS_BOT, DATACENTER_HARDWARE, INHUMAN_SPEED | Malicious Bot |
| AMAZON-02 | 3,021 | TZ_MISMATCH, DC_ASN, VPN_DETECTED, DATACENTER_HARDWARE, INHUMAN_SPEED | VPN |
| AS-BLAZINGSEO | 1,375 | TZ_MISMATCH, DC_ASN AUTOMATION_TOOL, DATACENTER_HARDWARE, INHUMAN_SPEED | Automation Tool |
| CENTURYLINK-US-LEGACY-QWEST | 1,136 |	TZ_MISMATCH, AUTOMATION_TOOL, DATACENTER_HARDWARE, INHUMAN_SPEED | Automation tool
| AS-BLAZINGSEO	| 1,006 | TZ_MISMATCH, DC_ASN, AUTOMATION_TOOL, DATACENTER_HARDWARE, INHUMAN_SPEED | Automation Tool

With these additions in the query above, we can see that these ASNs are responsible for malicious bots, automated activity, and VPNS. If we look at lower counts below 2,831, we see headless browser activity listed, which is also indicative of automated browsing.

### Interaction Time and ASN Correlation

Now that we've dove into our suspicions regarding timezones, user agents, and interaction times, the data must be tied together to show correlation between the variables. The next step is to group these variables together with the ASNs that have been identified as suspicious.

```sql
SELECT ASN, count() AS requests, avg(first_interaction_time) AS average_interaction FROM traffic WHERE first_interaction_time < 100 GROUP BY ASN ORDER BY requests DESC
```

Running the query above yields the following results: 

| ASN | Total Requests | Average First Interaction Time |
|-------|-------------|-------|
| AS-CHOOPA | 9,651 | 1.475892 |
| AS-BLAZINGSEO | 8,243 | 1.498241 |
| AMAZON-02 | 3,024 | 1.504960 |

To further tie the data together, the percentage of bot traffic with high confidence (< 100 ms) can be calculated by taking the result of the SQL query below and dividing it by the total number of rows.

```sql
SELECT count() FROM traffic WHERE first_interaction_time < 100
```

$$\frac{32,395}{126,959} \times 100 = 25.51\%$$

### Temporal Patterns

```sql
SELECT toHour(timestamp) as hour, COUNT(*) as requests FROM traffic WHERE ASN IN ('AS-CHOOPA', 'AS-BLAZINGSEO', 'AMAZON-02') GROUP BY hour ORDER BY hour
```
| Hour | Total Number of Requests |
|-------|-------------|
| 2 | 9,323 |
| 3 | 3,116 |
| 14 | 6,290 |
| 15 | 2,099 |

Analysis of high-confidence bot activity with specified ASNs reveals constant operation that is not consistent with human behavior. Overnight hours (2 AM - 3 AM) generated **12,439** requests from **AS-CHOOPA**, **AS-BLAZINGSEO**, and **AMAZON-02**. This time range is outside of business hours and continues during business hours with **8,389** requests.

### Endpoint Requests

Before we make inferences as to what the attackers' intentions are, we should first look at one more thing: the pages visited.

```sql
SELECT URL, count() FROM traffic WHERE (ASN LIKE '%AS-CHOOPA%' OR ASN LIKE '%AS-BLAZINGSEO%' OR ASN LIKE '%AMAZON-02%') AND first_interaction_time < 100 GROUP BY URL ORDER BY count() DESC
```

Omitting results with less than 1,000 total visits yields the following:

| Endpoint | Total Visits |
|----------|-------------|
| /checkout | 6,729 |
| /browse | 6,000 |
| /login | 4,844 |
| /products/detail | 1,157 |
| /account/orders | 1,130 |

Again, it is shown with high confidence that traffic originating from these ASNs implies automated bot activity.

### Wasted Ad Expenditures

```sql
SELECT COUNT(*) FROM traffic WHERE ASN IN ('AS-CHOOPA', 'AS-BLAZINGSEO', 'AMAZON-02') AND msclkid IS NOT NULL
```

| Metric | Total Value |
|-------|-------------|
| Bot Sessions from Paid Ads | 6,724 |
| Estimated Average CPC | $\$$0.05 - $\$$2 |
| Estimated Wasted Ad Expenditures | $\$$3,362 - $\$$13,448 |

The query above returns the number of requests from the three suspicious ASNs where the Google Click Identifier (`gclid`) contains a value, thus indicating that it was paid traffic. A total of **2,564** results were returned. Similarly, the same can be done with the `msclkid` variable, for which **4,160** results are returned for a total of **6,724** sessions out of 20,828. This is roughly **32.28%** of traffic from bots.  With this number being in the thousands, it is evident that bots are consuming the paid ad budget.

Average cost-per-click (CPC) rates for Google and Microsoft typically range between $\$$0.50 and $\$$2. Based on these estimates, automated traffic captured in this dataset is responsible for ~$\$$3,362 - ~$\$$13,448 during the analyzed period.

### Attacker Objective & Business Impact

The high volume of page requests for checkout, browse, product detail pages, and account order endpoints is highly indicative of inventory hoarding bots. These bots place in-demand products into carts and/or attempt to initiate conversion via checkout process initiation that prevents legitimate users from adding products to cart and checking out. This can negatively impact business operations by:

1. Blocking legitimate users from purchasing products
2. Reducing revenue due to legitimate users' inability to purchase the hoarded items
3. Creating customer frustration among those who cannot add in-stock items to their carts
4. Damaging consumer trust and site reputation for Shop Nova customers

The high number of requests to the login page indicates credential stuffing attempts in which attackers attempt to gain unauthorized access to existing user accounts using leaked credentials from other breaches. This can negatively impact business operations by:

1. Providing unauthorized account access
2. Allowing fraudulent purchases
3. Exposing customer data
4. Reducing consumer trust and site reputation for Shop Nova customers

Customers should be concerned about this due to the propensity for attackers to obtain unauthorized access to user accounts and make fraudulent purchases on thier behalf with saved addresses and payment information. Class-action lawsuits could follow, costing Shop Nova millions in data breach, GDPR, and other consumer privacy penalty fines, potentially reaching over $1 billion depending on the size and popularity of the organization.

### CHEQ Mitigation Strategy

CHEQ analysts propose the following mitigations for each finding:

| Priority | Vulnerability | Mitigation |
|-------|-------------|------|
| CRITICAL | Ad Fraud/Invalid Traffic | Block data center ASNs from ad campaigns |
| HIGH | Inventory Hoarding | Rate-limit checkouts and block canvas fingerprints `a3f9d21c`, `b7e4c920`, and `f1d3e85a` |
| HIGH | Credential Stuffing | Challenge suspicious authentications with MFA + deploy credential stuffing detection on `/login` endpoint |
| MEDIUM | Data Center Impersonation | Flag `hardware_concurrency` >= 128 where `device_type` contains a consumer device type | 
| MEDIUM | Location Spoofing | Deploy VPN detection for mismatched sessions and check timezones for consistency |


```python

```
