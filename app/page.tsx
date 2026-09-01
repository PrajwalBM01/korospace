import ColorBends from "@/components/ColorBends"
import CanvasVisual from "@/components/landing/CanvasVisual"
import ColorblendsBg from "@/components/landing/ColorblendsBg"
import Faq, { faqs } from "@/components/landing/Faq"
import Footer from "@/components/landing/Footer"
import Features, { BentoCard } from "@/components/landing/Features"
import {
  BranchVisual,
  ContextFlowVisual,
  CutoffVisual,
  KeyVisual,
  ModelVisual,
  NodeTypesVisual,
} from "@/components/landing/FeatureVisuals"
import GetStarted from "@/components/landing/GetStarted"
import Navbar from "@/components/landing/Navbar"
import { accent, Marked, points } from "@/components/landing/ProblemSolution"
import ThreadVisual from "@/components/landing/ThreadVisual"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  CornerDownRight,
  Split,
  Telescope,
  Workflow,
} from "lucide-react"
import Link from "next/link"
export default function Page() {
  return (
    <div className="h-full w-full">
      <ColorblendsBg />
      <div className="pointer-events-none fixed inset-0 bg-background/50 backdrop-blur-lg" />
      <Navbar />
      <section className="relative min-h-dvh">
        <div className="pointer-events-none relative flex min-h-dvh w-full justify-center">
          <div className="flex min-h-dvh w-full max-w-[1350px] flex-col">
            {/* room for the fixed navbar */}
            <div className="h-14 shrink-0" aria-hidden="true" />
            <div className="flex flex-1 flex-col items-center justify-center gap-10 px-5 py-10 sm:px-8 lg:flex-row lg:gap-6 lg:py-0">
              {/* left: copy */}
              <div className="flex w-full flex-col items-center justify-center lg:flex-1">
                <div className="flex w-full max-w-xl flex-col items-center lg:items-start">
                  <h1 className="text-center font-khand text-4xl leading-tight font-semibold text-balance sm:text-5xl lg:text-left xl:text-6xl">
                    Your{" "}
                    <span className="relative inline-block">
                      <span className="relative z-0 text-[#7ccf00] [-webkit-text-stroke:0.5px_black]">
                        Thoughts
                      </span>
                      <svg
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 60 250 130"
                        aria-hidden="true"
                        className="pointer-events-none absolute top-1/2 left-1/2 z-10 h-auto w-[118%] -translate-x-1/2 -translate-y-1/2"
                      >
                        <path
                          className="fill-foreground"
                          d="M0 0 C0.84046875 0.63421875 1.6809375 1.2684375 2.546875 1.921875 C11.21501207 9.26494653 16.78891991 19.21262819 18.3359375 30.4375 C18.70678467 38.65319122 16.25379792 44.9163906 10.9375 51.125 C-11.16057397 74.03758631 -48.83911237 79.08557715 -79 82 C-80.04414063 82.11085938 -81.08828125 82.22171875 -82.1640625 82.3359375 C-120.33340504 85.77210702 -175.75383171 85.22653233 -206.93359375 59.84765625 C-217.2569654 50.61711789 -220.99315458 41.79528504 -222 28 C-222.34114404 17.81621857 -219.58157036 9.22445501 -212.80078125 1.4921875 C-162.79924334 -46.0132994 -51.1871241 -41.70222055 0 0 Z M-132 -27 C-132 -26.67 -132 -26.34 -132 -26 C-129.69 -26 -127.38 -26 -125 -26 C-125 -26.33 -125 -26.66 -125 -27 C-127.31 -27 -129.62 -27 -132 -27 Z M-125 -28 C-125 -27.67 -125 -27.34 -125 -27 C-123.54484985 -26.90295776 -123.54484985 -26.90295776 -122.06030273 -26.80395508 C-85.26669787 -24.29461073 -49.4497388 -19.36036646 -20 5 C-19.67 5.66 -19.34 6.32 -19 7 C-19.46148437 6.67837891 -19.92296875 6.35675781 -20.3984375 6.02539062 C-59.54820332 -21.09317246 -103.31693201 -29.57966936 -150.44921875 -22.48046875 C-174.00247157 -17.27254552 -200.32414794 -3.80631034 -213.79296875 16.734375 C-217.38219537 22.90682174 -220.09933123 28.1095927 -218.46875 35.36328125 C-216.01674327 42.66254202 -211.39505303 47.65925958 -206 53 C-205.41734375 53.61617188 -204.8346875 54.23234375 -204.234375 54.8671875 C-195.40895491 63.49383687 -183.02588548 68.66896056 -171.4375 72.375 C-170.73197998 72.60131104 -170.02645996 72.82762207 -169.29956055 73.06079102 C-155.97374653 77.03777664 -142.90982813 78.55508414 -129.0625 78.4375 C-127.90473053 78.43293793 -127.90473053 78.43293793 -126.72357178 78.42828369 C-109.94195411 78.33193851 -93.57049045 76.52254649 -77 74 C-76.17179749 73.87459839 -75.34359497 73.74919678 -74.49029541 73.61999512 C-62.64778786 71.82272984 -50.81944989 69.9428166 -39 68 C-39 68.66 -39 69.32 -39 70 C-39.64509521 70.03883301 -40.29019043 70.07766602 -40.95483398 70.11767578 C-49.87442968 70.75102888 -58.63723304 72.0877049 -67.46362305 73.46917725 C-84.27307582 76.0940258 -101.06447329 78.34501871 -118 80 C-118 80.33 -118 80.66 -118 81 C-77.40948162 81.700859 -22.50719317 79.84695457 8.93359375 50.2734375 C13.74230708 44.98294381 16.42792391 38.3787544 16.2734375 31.1796875 C15.11619686 21.95482638 11.16820811 14.77319227 5 8 C4.48824219 7.40832031 3.97648438 6.81664062 3.44921875 6.20703125 C-19.52435995 -18.70476501 -60.54581161 -27.43241109 -93 -29 C-103.69633158 -29.36339973 -114.35693611 -29.21140565 -125 -28 Z M-210 2 C-214.59681794 7.1256554 -218.73710945 12.8813814 -219.1875 19.9375 C-219.125625 20.618125 -219.06375 21.29875 -219 22 C-217.36194803 19.84120929 -215.76391139 17.66485681 -214.203125 15.44921875 C-207.24849953 5.61537834 -200.47440882 -0.62777662 -190.3046875 -6.88671875 C-187.36001518 -8.76977753 -184.67886617 -10.76087224 -182 -13 C-191.15691803 -13 -203.64515967 -4.1918957 -210 2 Z "

                          transform="translate(227,99)"
                        />
                      </svg>
                    </span>{" "}
                    aren't linear, why should your{" "}
                    <span className="relative inline-block">
                      <span className="relative z-0 text-[#7ccf00] [-webkit-text-stroke:0.5px_black]">
                        tools
                      </span>
                      <svg
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 98 250 54"
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-1 left-1/2 z-10 h-auto w-[110%] -translate-x-1/2"
                      >
                        <path
                          d="M0 0 C0.33 0.99 0.66 1.98 1 3 C-1 6 -1 6 -2.65478516 6.63989258 C-5.93377471 7.14338098 -9.22071733 7.46663471 -12.5234375 7.76171875 C-14.09647892 7.90928773 -15.66947484 8.05734231 -17.24243164 8.20581055 C-18.07743195 8.28390961 -18.91243225 8.36200867 -19.7727356 8.44247437 C-36.58194947 10.02520681 -53.32507998 11.97276939 -70.0625 14.1875 C-71.06230896 14.31973969 -72.06211792 14.45197937 -73.09222412 14.58822632 C-81.39984361 15.69042517 -89.70537751 16.80354671 -98 18 C-97.33554871 18.01030746 -96.67109741 18.02061493 -95.98651123 18.03123474 C-88.91022191 18.14156868 -81.83400445 18.25590694 -74.7578125 18.37231445 C-72.13608391 18.4152545 -69.51434464 18.45666048 -66.89257812 18.49731445 C-48.58332899 18.78207812 -30.2968217 19.27184367 -12 20 C-12.33 21.65 -12.66 23.3 -13 25 C-19.07243113 27.0821881 -24.79421079 27.42215711 -31.18359375 27.6328125 C-32.23909927 27.67437469 -33.2946048 27.71593689 -34.38209534 27.75875854 C-37.73364756 27.8888897 -41.08549691 28.00711573 -44.4375 28.125 C-46.71812893 28.21145246 -48.99872849 28.29868361 -51.27929688 28.38671875 C-56.85255606 28.60016283 -62.42610679 28.80384986 -68 29 C-57.74156824 30.47451791 -47.48257518 31.94304875 -37.21484375 33.3515625 C-36.44298737 33.45764832 -35.67113098 33.56373413 -34.87588501 33.67303467 C-31.76045022 34.10103095 -28.64496479 34.52861554 -25.52905273 34.953125 C-23.19487288 35.27145455 -20.86108369 35.59252591 -18.52734375 35.9140625 C-17.4759446 36.05625717 -17.4759446 36.05625717 -16.40330505 36.20132446 C-13.21629354 36.6424876 -10.09918415 37.12441246 -7 38 C-7.875 42.875 -7.875 42.875 -9 44 C-16.10251159 44.29016718 -22.87831337 43.49809796 -29.90234375 42.50390625 C-31.02008682 42.35090561 -32.1378299 42.19790497 -33.28944397 42.04026794 C-36.83960449 41.55334693 -40.38857268 41.05832199 -43.9375 40.5625 C-47.48304192 40.07171994 -51.02881359 39.58267905 -54.57484436 39.09544373 C-56.77344685 38.79286832 -58.97174133 38.48804289 -61.16966248 38.18055725 C-71.84160444 36.7024067 -82.42067566 35.7807372 -93.1875 35.375 C-94.37190674 35.32996338 -95.55631348 35.28492676 -96.77661133 35.23852539 C-105.2622068 34.95917617 -113.55756696 35.08080712 -122 36 C-121.6875 33.625 -121.6875 33.625 -121 31 C-118.22226858 29.14817905 -117.11616555 28.6658319 -113.98828125 28.1484375 C-112.85229492 27.95507812 -112.85229492 27.95507812 -111.69335938 27.7578125 C-110.90767578 27.63148438 -110.12199219 27.50515625 -109.3125 27.375 C-108.51521484 27.2409375 -107.71792969 27.106875 -106.89648438 26.96875 C-104.9320598 26.6393854 -102.96616073 26.31883687 -101 26 C-133.47333691 26.4226414 -164.94383103 28.41629738 -197 34 C-196.67 32.02 -196.34 30.04 -196 28 C-189.71610348 25.67559496 -183.63402479 24.27464999 -177.0078125 23.3515625 C-176.07226532 23.21392487 -175.13671814 23.07628723 -174.17282104 22.93447876 C-172.18356909 22.64217472 -170.19381702 22.35325668 -168.20361328 22.06750488 C-163.01063185 21.32109102 -157.8215904 20.54846369 -152.6328125 19.7734375 C-151.61544006 19.62173096 -150.59806763 19.47002441 -149.54986572 19.3137207 C-140.61309241 17.96813785 -131.74503535 16.36259329 -122.87231445 14.64428711 C-112.6353263 12.68337823 -102.34086854 11.28607364 -92 10 C-135.56556425 10.95748493 -178.07273317 17.44437049 -220.45141602 27.25415039 C-221.48525421 27.49261185 -222.51909241 27.7310733 -223.58425903 27.97676086 C-225.52849708 28.42641292 -227.4719013 28.87969237 -229.41427612 29.33732605 C-234.60541598 30.53964924 -239.69990063 31.43904481 -245 32 C-244.03680511 29.4960187 -243.43841488 28.24760477 -241.06640625 26.90795898 C-231.84431864 23.77967868 -222.44846342 21.39549467 -213 19.0625 C-211.66843369 18.7324295 -211.66843369 18.7324295 -210.30996704 18.39569092 C-161.62192451 6.36972857 -112.15983647 2.65190302 -62.15380859 1.07006836 C-59.3988226 0.9827844 -56.643958 0.89259204 -53.88916016 0.79956055 C-35.9222663 0.19330179 -17.97833932 -0.14235383 0 0 Z "
                          className="fill-foreground"
                          transform="translate(247,103)"
                        />
                      </svg>
                    </span>{" "}
                    be?
                  </h1>

                  <p className="mt-8 max-w-md text-center font-mono text-sm sm:text-base lg:mt-10 lg:text-left">
                    korospace is a canvas based tool where you can share context
                    between nodes without the hassle of hopping between
                    platforms.
                  </p>

                  <div className="pointer-events-auto mt-8 flex w-full flex-col items-center justify-center gap-2 font-mono lg:items-start">
                    <GetStarted text="Get started" className="text-md p-4" />
                  </div>
                </div>
              </div>

              {/* right: demo */}
              <div className="pointer-events-auto flex w-full flex-col items-center justify-center lg:flex-1">
                <div className="group relative w-full max-w-2xl overflow-hidden rounded bg-black">
                  <video
                    src="https://dfvwlznpwuhtzzlanurx.supabase.co/storage/v1/object/public/korospace-prod/Video%20Project%208.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="pointer-events-none block aspect-video w-full object-cover"
                  />
                </div>

                <div className="mt-4 grid w-full max-w-2xl grid-cols-2 gap-x-4 gap-y-3 font-mono text-xs sm:text-sm lg:flex lg:w-auto lg:divide-x-2 lg:divide-[#7ccf00]">
                  <div className="flex items-center gap-2 lg:pr-4">
                    <Split className="size-4 shrink-0 rotate-90 sm:size-5" />
                    <p>Branch conversations</p>
                  </div>
                  <div className="flex items-center gap-2 lg:px-4">
                    <Workflow className="size-4 shrink-0 sm:size-5" />
                    <p>Share context</p>
                  </div>
                  <div className="flex items-center gap-2 lg:px-4">
                    <Bot className="size-4 shrink-0 sm:size-5" />
                    <p>Switch model</p>
                  </div>
                  <div className="flex items-center gap-2 lg:pl-4">
                    <Telescope className="size-4 shrink-0 sm:size-5" />
                    <p>Explore without limits</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        id="why"
        className="relative min-h-dvh scroll-mt-16 overflow-hidden"
      >
        <div className="relative mx-auto grid w-full max-w-[1350px] grid-cols-2 items-center gap-6 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.5fr_0.85fr] lg:gap-8 xl:gap-12">
          <div className="order-2 col-span-2 h-[32rem] sm:col-span-1 lg:order-1 lg:h-[34rem]">
            <ThreadVisual />
          </div>
          <div className="order-1 col-span-2 flex flex-col items-center justify-center text-center lg:order-2 lg:col-span-1">
            <span className="rounded-full border border-border bg-card/60 px-3 py-1 font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
              why korospace
            </span>

            <h2 className="mt-5 max-w-xl font-khand text-3xl leading-tight font-semibold text-balance sm:text-4xl xl:text-5xl">
              A chat window makes you pick: follow the <Marked>thought</Marked>,
              or keep the <Marked>thread</Marked>.
            </h2>

            <p className="mt-4 max-w-md font-mono text-sm text-muted-foreground sm:text-base">
              You can't do both in a scroll. So you start over somewhere else
              and hope you carried the parts that mattered.
            </p>

            <ol className="mt-8 w-full max-w-lg space-y-5 text-left sm:mt-10">
              {points.map((point, i) => (
                <li key={point.problem} className="flex gap-4">
                  <span
                    className={`font-khand text-lg leading-6 font-semibold tabular-nums ${accent}`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 space-y-1.5">
                    <p className="font-mono text-sm font-semibold sm:text-[0.95rem]">
                      {point.problem}
                    </p>
                    <p className="flex gap-2 font-mono text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      <CornerDownRight
                        className={`mt-0.5 size-3.5 shrink-0 ${accent}`}
                      />
                      <span>{point.solution}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-9 flex flex-col items-center gap-2 font-mono sm:mt-10">
              <GetStarted text="Get started" className="text-md p-4" />
              <span className="text-[0.65rem] text-muted-foreground">
                Early access · desktop only for now
              </span>
            </div>
          </div>
          <div className="order-3 col-span-2 h-[32rem] sm:col-span-1 lg:h-[34rem]">
            <CanvasVisual />
          </div>
        </div>
      </section>
      <section
        id="features"
        className="relative scroll-mt-16 overflow-hidden py-16 sm:py-24"
      >
        <div className="relative mx-auto w-full max-w-[1350px] px-5 sm:px-8">
          <div className="flex flex-col items-center text-center">
            <span className="rounded-full border border-border bg-card/60 px-3 py-1 font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
              features
            </span>
            <h2 className="mt-5 max-w-2xl font-khand text-3xl leading-tight font-semibold text-balance sm:text-4xl xl:text-5xl">
              Six things a scrolling chat window can&rsquo;t do.
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 lg:h-[40rem] lg:grid-cols-5 lg:grid-rows-[1.12fr_0.88fr]">
            <BentoCard
              title="Branch from any reply"
              description="Highlight a sentence in an answer and branch it. You get a new node wired to the original, carrying the thread up to that point plus the text you picked."
              visual={<BranchVisual />}
              className="min-h-[19rem] sm:col-span-2 lg:col-span-2 lg:row-start-1 lg:min-h-0"
            />
            <BentoCard
              title="A model per node"
              description="Draft on a cheap one, reason on an expensive one."
              visual={<ModelVisual />}
              className="min-h-[15rem] sm:col-start-2 sm:row-start-2 sm:min-h-[17rem] lg:col-start-1 lg:row-start-2 lg:min-h-0"
            />

            <BentoCard
              title="Bring your own key"
              description="Add a provider key to unlock its models."
              visual={<KeyVisual />}
              className="min-h-[15rem] sm:col-start-2 sm:row-start-3 sm:min-h-[17rem] lg:col-start-2 lg:row-start-2 lg:min-h-0"
            />

            <BentoCard
              title="Context flows down the wires"
              description="A node walks its whole ancestor graph, oldest first, and inherits exactly what you connected to it. Nothing to copy across."
              visual={<ContextFlowVisual />}
              className="min-h-[34rem] sm:col-start-1 sm:row-span-2 sm:row-start-2 sm:min-h-0 lg:col-span-1 lg:col-start-3 lg:row-span-2 lg:row-start-1"
            />

            <BentoCard
              title="Nodes for more than chat"
              description="Text nodes hold notes that become reference material for everything downstream of them."
              visual={<NodeTypesVisual />}
              className="min-h-[17rem] sm:col-span-2 sm:row-start-4 lg:col-span-2 lg:col-start-4 lg:row-start-1 lg:min-h-0"
            />

            <BentoCard
              title="Branches remember where they split"
              description="A branch sees the conversation as it was at the split, not whatever the parent went on to say afterwards."
              visual={<CutoffVisual />}
              className="min-h-[16rem] sm:col-span-2 sm:row-start-5 lg:col-span-2 lg:col-start-4 lg:row-start-2 lg:min-h-0"
            />
          </div>
        </div>
      </section>
      <section
        id="faq"
        className="relative scroll-mt-16 overflow-hidden py-16 sm:py-24"
      >
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
      <Footer />
    </div>
  )
}
