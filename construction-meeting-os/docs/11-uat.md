# 11 UAT

| ID | Test | Expected | Result |
|---|---|---|---|
| UAT-01 | One segment creates multiple events | 5 types | PASS |
| UAT-02 | Verify without reviewer | blocked | PASS |
| UAT-03 | Invalid evidence segment | blocked | PASS |
| UAT-04 | Verified event retains evidence | SEG-T01 | PASS |
| UAT-05 | AI original retained | present | PASS |
| UAT-06 | Unverified draft official? | never | PASS |
| UAT-07 | Relative date source retained | 下週三/明天 | PASS |
| UAT-08 | Production LINE/Recall integration | live external integration | NOT TESTED |

Automated local core result: 8 assertions / 8 PASS. UAT-08 is explicitly not claimed as complete; credentials and live service integration are outside this local prototype.
