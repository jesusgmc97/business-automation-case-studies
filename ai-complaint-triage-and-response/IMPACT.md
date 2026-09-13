# Operational Impact

This document estimates the operational impact of automating email review, complaint classification, case creation, SharePoint registration and the initial response process.

The figures below are illustrative estimates of equivalent manual work, not measured production results.

## Manual process

Without automation, a user handling an incoming email may need to:

1. Open the message and identify the sender
2. Read and understand the content
3. Decide whether the message should be treated as a complaint
4. Save the relevant email content
5. Generate or assign a unique case identifier
6. Create the case folder
7. Register the case in SharePoint
8. Send the appropriate initial response

The workload depends on whether the message is ultimately classified as a complaint.

## Baseline assumptions

A conservative estimate is used for the manual process:

```text
Initial review and classification
~2.5 minutes per email

Additional complaint handling
~3.5 minutes per complaint

Complete complaint process
~6 minutes per complaint
```

The additional complaint handling time includes case creation, folder creation, content storage, SharePoint registration and response handling.

## Complete complaint processing

Using a baseline of approximately 6 minutes per complaint:

| Complaints processed | Estimated manual effort |
|---:|---:|
| 100 | ~10 hours |
| 500 | ~50 hours |
| 1,000 | ~100 hours |
| 2,500 | ~250 hours |
| 5,000 | ~500 hours |

These figures represent the estimated manual effort required to complete the equivalent process without automation.

## Mixed email scenario

The workflow also evaluates messages that ultimately are not complaints, so the total benefit depends on both total email volume and complaint rate.

For example, with 1,000 incoming emails and a 20% complaint rate:

```text
Initial review and classification
1,000 emails x 2.5 minutes
= 2,500 minutes
= ~41.7 hours

Additional handling for 200 complaints
200 complaints x 3.5 minutes
= 700 minutes
= ~11.7 hours

Estimated total manual effort
= ~53.3 hours
```

At the same monthly volume, the equivalent annual manual effort would be approximately:

```text
3,200 minutes per month x 12 months / 60
= 640 hours/year
```

This example is illustrative. Actual savings depend on real email volume, complaint rate and the amount of manual intervention that remains after automation.

## Automated process

The workflow automates several repetitive stages:

- Email ingestion
- Sender, subject and body extraction
- Preparation of the AI classification context
- Prompt-engineered complaint classification
- Conditional routing
- Unique case ID generation
- Case folder creation
- Email content storage
- SharePoint registration
- Initial automatic response

Human effort can therefore be concentrated on exceptions, complex cases and subsequent complaint handling rather than repetitive intake work.

## Prompt-engineered classification

The classification step removes a manual judgement task that otherwise has to be repeated for every incoming message.

The model evaluates the context provided through the classification prompt and returns a structured decision that Power Automate can use directly.

The operational value of this stage depends on both efficiency and classification quality.

Relevant quality indicators include:

- Classification accuracy
- False positives
- False negatives
- Percentage of emails requiring manual review
- Complaint rate

False negatives are particularly important because they represent complaints that could be incorrectly excluded from the complaint process.

## Potential benefits

The automation can contribute to:

- Reduced manual email review
- Reduced complaint registration time
- Faster case creation
- Consistent case folder structure
- Reduced copy-and-paste work
- Faster initial response times
- More consistent classification criteria
- Improved process traceability
- Better scalability as email volume increases
- More structured information for reporting and analysis

## Measurement methodology

A useful model for measuring operational savings is:

```text
Manual review time
+
Manual complaint handling time
-
Remaining human intervention
=
Estimated time saved
```

For a mixed email population:

```text
(Total emails x average review time)
+
(Number of complaints x additional complaint handling time)
=
Estimated manual effort before automation
```

Using the current baseline:

```text
(Total emails x 2.5 minutes)
+
(Number of complaints x 3.5 minutes)
```

These estimates describe the model assumptions; no measured production savings are claimed.

## Operational indicators

Useful production metrics include:

- Total emails processed
- Complaints identified
- Complaint rate
- Classification accuracy
- False positives
- False negatives
- Cases requiring manual review
- Average manual handling time before automation
- Average processing time after automation
- Average initial response time
- Cases created automatically
- Administrative hours saved

These metrics make it possible to evaluate both the efficiency of the automation and the reliability of the AI classification step.
