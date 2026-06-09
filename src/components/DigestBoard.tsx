import './DigestBoard.css'

/**
 * Topic board placeholder (issue #1 scaffold). Renders the empty state only;
 * the real board — sections grouped by category with digest cards — is built in
 * issues #2/#3, fed by the add-article form (#12) and the API layer (#3/#9).
 */
export default function DigestBoard() {
  return (
    <section className="digest-board">
      <p className="digest-empty">
        No digests yet — the add-article form and the topic board arrive next. ✨
      </p>
    </section>
  )
}
