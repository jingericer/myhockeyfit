# Community feedback

Public page: /volunteer.html. Rating required; first name/nickname, age group, feature and comment optional. Blank name is anonymous. No email, photo or browser persistence. Feedback is private, with no public ratings or names.

Cloudflare provisions FEEDBACK_INBOX on deploy. Its SQLite feedback table holds submissions, separate from photo processing. No OpenAI call is made. A hashed IP counter allows five feedback submissions per rolling hour, and expired counters are cleaned by an alarm. Feedback rows contain no IP. Submission UUIDs prevent duplicate records after retries. Storage is capped at 10,000 records. Origin, size and schema validation plus a honeypot provide basic abuse protection, not proof of a human.

## Private export

To download feedback, the owner can add a Cloudflare Worker secret named FEEDBACK_ADMIN_TOKEN with a random private value. GET /api/feedback requires Authorization: Bearer followed by that value and returns JSON. With no secret configured, all exports are denied. Never put the token in the webpage, URL, source control or a public chat. Use an authenticated API client and save the JSON privately. This optional secret is only for reading feedback; submissions work without it.

There is no email notification and names are never published automatically. Feedback remains until the owner deletes it from storage. No public administrative endpoint for deletion is exposed.
