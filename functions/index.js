const functions = require('firebase-functions')
const md = require('markdown-it')();

exports.renderMarkdown = functions.firestore
  .document('News/{newsId}')
  .onWrite((change, context) => {
    // Retrieve the current and previous value
    const data = change.after.exists ? change.after.data() : null;
    const previousData = change.before.data();

    // This is crucial to prevent infinite loops.
    if (!data || !data.Markdown || (data.Content && data.Markdown === previousData.Markdown)) return null;

    return change.after.ref.set({
      Content: md.render(data.Markdown)
    }, {merge: true});
  });