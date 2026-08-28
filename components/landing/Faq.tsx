import { ArrowUpRight } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em] text-foreground">
    {children}
  </code>
)

export const faqs: { id: string; question: string; answer: React.ReactNode }[] = [
  {
    id: "why-not-new-chat",
    question: "How is this different from just opening a new chat?",
    answer: (
      <>
        <p>
          A new chat starts empty. You paste the background back in by hand, you
          guess at which parts mattered, and the thread you came from is now
          somewhere else entirely.
        </p>
        <p>
          A branch keeps the link. The new node inherits the conversation up to
          the point you split, the original is untouched, and both sit on the
          same canvas where you can see how they relate.
        </p>
      </>
    ),
  },
  {
    id: "what-gets-sent",
    question: "What exactly does a node send to the model?",
    answer: (
      <>
        <p>
          Its own thread, plus every ancestor you wired to it. The server walks
          the whole ancestor graph, loads each one&rsquo;s content, and
          assembles them oldest-first into a <Code>&lt;sources&gt;</Code> block
          in the system prompt.
        </p>
        <p>
          Nodes you didn&rsquo;t connect are not included, and the walk is
          scoped to one canvas, so context can never leak in from another.
        </p>
      </>
    ),
  },
  {
    id: "branch-cutoff",
    question: "If I branch, does the branch see what the parent said next?",
    answer: (
      <p>
        No. The edge records the message you branched at, and the parent&rsquo;s
        history is sliced there. A branch sees the conversation as it was at the
        split, however far the original runs on afterwards. Anything you
        highlighted rides along with it.
      </p>
    ),
  },
  {
    id: "own-key",
    question: "Do I need my own API key to start?",
    answer: (
      <>
        <p>
          No. Some models run on the platform&rsquo;s key — on the free tier,
          the ones priced at $0. Those carry a daily cap, plus a burst limit
          that applies to everyone.
        </p>
        <p>
          Add your own OpenRouter, Anthropic, OpenAI or Google key and that
          provider&rsquo;s models unlock, with no daily cap, since you&rsquo;re
          the one paying for them.
        </p>
      </>
    ),
  },
  {
    id: "key-safety",
    question: "What happens to my API key?",
    answer: (
      <>
        <p>
          It&rsquo;s encrypted with AES-256-GCM before it&rsquo;s stored, with a
          fresh IV every time and separate encryption and fingerprinting keys
          derived from the master secret. The ciphertext is bound to your user
          id and provider, so it can&rsquo;t be replayed under another account.
        </p>
        <p>
          It&rsquo;s decrypted only inside the request that needs it, and never
          sent back to the browser — the settings page only ever reads which
          providers you have, not the keys themselves.
        </p>
      </>
    ),
  },
  {
    id: "cycles",
    question: "What stops a loop if I wire two nodes into each other?",
    answer: (
      <p>
        Cycles are rejected on the client and checked again on the server, so a
        bad edge never gets saved. The context walk also carries a visited set,
        which means even a stray cycle terminates instead of hanging.
      </p>
    ),
  },
  {
    id: "mobile",
    question: "Does it work on my phone?",
    answer: (
      <p>
        Not yet. The canvas assumes a mouse — right-click to create a node, drag
        to connect two, select text in a reply to branch from it. Desktop only
        for now.
      </p>
    ),
  },
  {
    id: "rough-edges",
    question: "What’s still rough?",
    answer: (
      <>
        <p>
          One canvas per account, created for you at signup — no list, rename or
          delete yet. Web nodes are visible but disabled until they&rsquo;re
          hardened against SSRF and prompt injection, since they&rsquo;d pull
          third-party pages into a system prompt.
        </p>
        <p>
          Context has no token budget yet, so a deep graph can get expensive or
          overrun a model&rsquo;s context window. And there&rsquo;s no password
          reset — if you want a recovery path, sign in with Google.
        </p>
      </>
    ),
  },
]

const Faq = () => {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <div className="relative mx-auto w-full max-w-[1350px] px-5 sm:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-[1.55fr_1fr] lg:gap-12">
          <Accordion
            type="single"
            collapsible
            defaultValue={faqs[0].id}
            className="order-2 rounded-xl border-border bg-card/70 backdrop-blur-sm lg:order-1"
          >
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="px-4 py-4 font-mono text-sm leading-relaxed font-medium transition-colors hover:bg-muted/40 hover:no-underline aria-expanded:**:data-[slot=accordion-trigger-icon]:text-[oklch(0.55_0.17_131)] sm:text-[0.95rem] dark:aria-expanded:**:data-[slot=accordion-trigger-icon]:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-2 pr-10 font-mono text-xs leading-relaxed text-muted-foreground sm:text-[0.8rem]">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* the sketch's box: what the section is, and where to go if it
              didn't answer the thing you actually came for */}
          <div className="order-1 lg:sticky lg:top-8 lg:order-2">
            <div className="rounded-xl border border-border bg-card/70 p-6 backdrop-blur-sm">
              <span className="rounded-full border border-border bg-card/60 px-3 py-1 font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                faq
              </span>

              <h2 className="mt-5 font-khand text-3xl leading-tight font-semibold text-balance sm:text-4xl">
                Questions worth asking before you sign up.
              </h2>

              <p className="mt-3 font-mono text-sm leading-relaxed text-muted-foreground">
                Short answers, and honest ones where it matters.
              </p>

              <div className="mt-6 border-t border-border pt-5">
                <p className="font-mono text-xs text-muted-foreground">
                  Still stuck on something?
                </p>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="mt-3 h-9 px-3 font-mono text-sm"
                >
                  <a
                    href="https://x.com/xshadowdev"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ask on X
                    <ArrowUpRight className="size-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Faq
