# create-node-meeting-artifacts
Tool to create artifacts for node.js team meetings

Uses the Foundation calendar to find the next instance of the meeting,
and then creates an issue and matching google doc for minutes. The key
thing is that it automatically creates the issue in github and the doc
in google docs as opposed to just creating the content.

Re-uses make-node-meeting for much of the content generation.

The hardest part to get going is doing the google auth setup
as described in: https://github.com/mhdawson/google-auth-wrapper.

Basic documentation for each of the templates lives in [TEMPLATES_DOCUMENTATION.md](./TEMPLATES_DOCUMENTATION.md)

Currently I'm testing out for generation of the  Node.js TSC meetings.


NOTE: The following must be commented out of make-node-meeting


```
echo -n "Previous Meeting Minutes Google Docs URL: "
read prev_doc_url
echo -n "This Meeting Minutes Google Docs URL: "
read curr_doc_url
```
