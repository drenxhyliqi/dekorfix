import { company } from "@/config/site";
import type { Locale } from "@/i18n/config";

/*
 * DRAFT legal texts, written from what this website actually does (no cookies,
 * no analytics, no forms; two browser-storage items; external links only on
 * click) and from Kosovo's Law No. 06/L-082 on Protection of Personal Data.
 * To be reviewed and approved by Dekorfix, ideally with legal counsel, before
 * the site goes live. Update `updated` with every change.
 */

export type LegalKey = "privacy" | "terms" | "cookies";

export type LegalBlock =
  | { p: string }
  | { list: string[] }
  | { table: { head: string[]; rows: string[][] } };

export interface LegalSection {
  id: string;
  title: string;
  blocks: LegalBlock[];
}

export interface LegalDoc {
  title: string;
  intro: string;
  sections: LegalSection[];
}

/** Date of the current version, shown at the top of each page. */
export const LEGAL_UPDATED = { en: "8 October 2026", sq: "8 tetor 2026" } as const;

const address = {
  en: `${company.legalName}, Zona Industriale, Shirokë, 23000 Suharekë, Kosovo`,
  sq: `${company.legalName}, Zona Industriale, Shirokë, 23000 Suharekë, Kosovë`,
};
const phone = company.phones[0].display;
const email = company.email;
const INTRO_KEY = "dfx-intro-seen";
const STUDIO_KEY = "dekorfix:project-studio:v2";

export const legalDocs: Record<Locale, Record<LegalKey, LegalDoc>> = {
  en: {
    privacy: {
      title: "Privacy policy",
      intro:
        "This policy explains what personal data Dekorfix processes when you use this website or contact us, and the rights you have.",
      sections: [
        {
          id: "who-we-are",
          title: "Who we are",
          blocks: [
            { p: `${address.en}, is responsible for the processing described here (the controller).` },
            { p: `You can reach us at ${email} or ${phone}.` },
          ],
        },
        {
          id: "what-we-collect",
          title: "What this website collects",
          blocks: [
            {
              p: "This website has no accounts, forms or analytics, and it does not set cookies. We do not ask you for personal data to use it.",
            },
            {
              p: "Like every website, it is delivered by servers that receive technical data with each request, such as your IP address, the page requested, the time and your browser type. Our hosting provider may keep this data in server logs for a short time to keep the website secure and working.",
            },
          ],
        },
        {
          id: "your-browser",
          title: "What stays in your browser",
          blocks: [
            {
              p: "Two features keep a small amount of data in your own browser, not on our servers: one remembers that the opening animation has been shown, and Project Studio saves the house you plan. The cookie policy describes both.",
            },
          ],
        },
        {
          id: "contacting-us",
          title: "When you contact us",
          blocks: [
            {
              p: "If you call or email us, we use your name, contact details and message to answer you and, where relevant, to prepare an offer. We keep this correspondence only as long as needed for that purpose and for our legal obligations.",
            },
          ],
        },
        {
          id: "legal-basis",
          title: "Why we may process it",
          blocks: [
            {
              p: "We process personal data under Law No. 06/L-082 on Protection of Personal Data of the Republic of Kosovo, on these grounds:",
            },
            {
              list: [
                "our legitimate interest in running a secure, working website and answering enquiries;",
                "steps you ask us to take before a contract, such as preparing an offer;",
                "our legal obligations, for example for accounting.",
              ],
            },
          ],
        },
        {
          id: "sharing",
          title: "Who receives it",
          blocks: [
            {
              p: "We do not sell personal data. It may be processed on our behalf, and only on our instructions, by the providers that host this website and our email.",
            },
            {
              p: "Links to Google Maps, Facebook and Instagram open those services, which then process data under their own privacy policies.",
            },
          ],
        },
        {
          id: "your-rights",
          title: "Your rights",
          blocks: [
            { p: "You have the right to:" },
            {
              list: [
                "know whether we hold personal data about you and receive a copy;",
                "have inaccurate data corrected;",
                "have data deleted when it is no longer needed;",
                "object to or restrict how we process it;",
                "complain to the Information and Privacy Agency of Kosovo (Agjencia për Informim dhe Privatësi).",
              ],
            },
            { p: `To exercise these rights, write to ${email}.` },
          ],
        },
        {
          id: "changes",
          title: "Changes to this policy",
          blocks: [{ p: "We may update this policy. The date at the top of the page shows the current version." }],
        },
      ],
    },
    terms: {
      title: "Terms of use",
      intro: `These terms apply to your use of this website, operated by ${company.legalName}.`,
      sections: [
        {
          id: "using",
          title: "Using this website",
          blocks: [
            {
              p: "You may use this website to learn about Dekorfix and its products. Please do not misuse it, for example by trying to disrupt it or to access it in ways it is not designed for.",
            },
          ],
        },
        {
          id: "product-information",
          title: "Product information",
          blocks: [
            {
              p: "We describe our products as accurately as we can. Pack sizes, coverage rates and other details are given for information; the product label and technical data sheet take precedence. Images may differ slightly from the actual product.",
            },
          ],
        },
        {
          id: "estimates",
          title: "Estimates and planning tools",
          blocks: [
            {
              p: "The material calculator and Project Studio give estimates based on published average coverage. Actual consumption depends on the surface, the conditions and how a product is applied, so estimates are not a guarantee. Please confirm quantities with us before ordering.",
            },
          ],
        },
        {
          id: "offers",
          title: "Offers and orders",
          blocks: [
            {
              p: "Nothing on this website is a binding offer. Prices, availability and orders are agreed directly with Dekorfix.",
            },
          ],
        },
        {
          id: "intellectual-property",
          title: "Intellectual property",
          blocks: [
            {
              p: `The Dekorfix name and logo, product names, texts, images and design of this website belong to ${company.legalName} or are used with permission. You may not copy or reuse them without our written consent, except for personal, non-commercial use.`,
            },
          ],
        },
        {
          id: "links",
          title: "Links to other websites",
          blocks: [
            {
              p: "We link to services such as Google Maps, Facebook and Instagram. We are not responsible for their content or practices.",
            },
          ],
        },
        {
          id: "liability",
          title: "Liability",
          blocks: [
            {
              p: "We work to keep this website accurate and available, but cannot guarantee that it is always error-free or uninterrupted. To the extent permitted by law, Dekorfix is not liable for losses arising from the use of this website or from reliance on its information.",
            },
          ],
        },
        {
          id: "law",
          title: "Governing law",
          blocks: [{ p: "These terms are governed by the laws of the Republic of Kosovo." }],
        },
        {
          id: "contact",
          title: "Contact",
          blocks: [{ p: `Questions about these terms: ${email}, ${phone}.` }],
        },
      ],
    },
    cookies: {
      title: "Cookie policy",
      intro: "This page explains what this website stores on your device, and why you do not see a cookie banner.",
      sections: [
        {
          id: "cookies",
          title: "Cookies",
          blocks: [
            {
              p: "This website does not set cookies, and it does not use analytics or advertising trackers. That is why there is no cookie banner.",
            },
          ],
        },
        {
          id: "browser-storage",
          title: "Storage in your browser",
          blocks: [
            {
              p: "Two features use your browser's own storage. The data stays on your device and is not sent to Dekorfix.",
            },
            {
              table: {
                head: ["Name", "Type", "Purpose", "Kept for"],
                rows: [
                  [
                    INTRO_KEY,
                    "Session storage",
                    "Remembers that the opening animation has been shown, so it plays once per visit.",
                    "Until the browser tab or window is closed",
                  ],
                  [
                    STUDIO_KEY,
                    "Local storage",
                    "Saves the house you plan in Project Studio, so you can come back to it.",
                    "Until you clear it in your browser",
                  ],
                ],
              },
            },
          ],
        },
        {
          id: "fonts-images",
          title: "Fonts and images",
          blocks: [
            {
              p: "Fonts and images are served by this website itself. No requests are made to third-party font or image services while you browse.",
            },
          ],
        },
        {
          id: "third-parties",
          title: "Third-party services",
          blocks: [
            {
              p: "Google Maps, Facebook and Instagram are only opened when you follow a link to them. They then apply their own cookie policies.",
            },
          ],
        },
        {
          id: "managing",
          title: "Removing stored data",
          blocks: [
            {
              p: "You can delete this data at any time in your browser's settings, under site data or storage for this website. Clearing it resets Project Studio.",
            },
          ],
        },
        {
          id: "changes",
          title: "Changes",
          blocks: [
            {
              p: "If this website starts using cookies or similar technologies, we will update this page and ask for your consent where it is required.",
            },
          ],
        },
      ],
    },
  },
  sq: {
    privacy: {
      title: "Politika e privatësisë",
      intro:
        "Kjo politikë shpjegon cilat të dhëna personale përpunon Dekorfix kur përdorni këtë faqe ose na kontaktoni, si dhe të drejtat që keni.",
      sections: [
        {
          id: "who-we-are",
          title: "Kush jemi",
          blocks: [
            { p: `${address.sq}, është përgjegjëse për përpunimin e përshkruar këtu (kontrolluesi).` },
            { p: `Mund të na kontaktoni në ${email} ose ${phone}.` },
          ],
        },
        {
          id: "what-we-collect",
          title: "Çfarë mbledh kjo faqe",
          blocks: [
            {
              p: "Kjo faqe nuk ka llogari, formularë apo analitikë dhe nuk vendos cookies. Nuk ju kërkojmë të dhëna personale për ta përdorur.",
            },
            {
              p: "Si çdo faqe interneti, ajo shërbehet nga serverë që me çdo kërkesë marrin të dhëna teknike, si adresa IP, faqja e kërkuar, koha dhe lloji i shfletuesit. Ofruesi ynë i hostimit mund t'i ruajë këto të dhëna për një kohë të shkurtër në regjistrat e serverit, për ta mbajtur faqen të sigurt dhe funksionale.",
            },
          ],
        },
        {
          id: "your-browser",
          title: "Çfarë mbetet në shfletuesin tuaj",
          blocks: [
            {
              p: "Dy funksione ruajnë një sasi të vogël të dhënash në shfletuesin tuaj, jo në serverët tanë: njëri mban mend që animacioni hyrës është shfaqur, ndërsa Project Studio ruan shtëpinë që planifikoni. Politika e cookies i përshkruan të dyja.",
            },
          ],
        },
        {
          id: "contacting-us",
          title: "Kur na kontaktoni",
          blocks: [
            {
              p: "Nëse na telefononi ose na shkruani, përdorim emrin, të dhënat e kontaktit dhe mesazhin tuaj për t'ju përgjigjur dhe, kur është e nevojshme, për t'ju përgatitur një ofertë. Këtë korrespondencë e ruajmë vetëm për aq kohë sa nevojitet për këtë qëllim dhe për detyrimet tona ligjore.",
            },
          ],
        },
        {
          id: "legal-basis",
          title: "Pse mund t'i përpunojmë",
          blocks: [
            {
              p: "Të dhënat personale i përpunojmë sipas Ligjit Nr. 06/L-082 për Mbrojtjen e të Dhënave Personale të Republikës së Kosovës, mbi këto baza:",
            },
            {
              list: [
                "interesi ynë legjitim për të mbajtur një faqe të sigurt e funksionale dhe për t'iu përgjigjur pyetjeve;",
                "hapat që na kërkoni t'i ndërmarrim para një kontrate, si përgatitja e një oferte;",
                "detyrimet tona ligjore, për shembull për kontabilitet.",
              ],
            },
          ],
        },
        {
          id: "sharing",
          title: "Kush i merr",
          blocks: [
            {
              p: "Nuk i shesim të dhënat personale. Ato mund të përpunohen në emrin tonë, dhe vetëm sipas udhëzimeve tona, nga ofruesit që hostojnë këtë faqe dhe postën tonë elektronike.",
            },
            {
              p: "Lidhjet për në Google Maps, Facebook dhe Instagram hapin ato shërbime, të cilat më pas i përpunojnë të dhënat sipas politikave të tyre të privatësisë.",
            },
          ],
        },
        {
          id: "your-rights",
          title: "Të drejtat tuaja",
          blocks: [
            { p: "Keni të drejtë:" },
            {
              list: [
                "të dini nëse mbajmë të dhëna personale për ju dhe të merrni një kopje të tyre;",
                "të korrigjohen të dhënat e pasakta;",
                "të fshihen të dhënat kur nuk nevojiten më;",
                "të kundërshtoni ose të kufizoni mënyrën si i përpunojmë;",
                "të paraqisni ankesë në Agjencinë për Informim dhe Privatësi të Kosovës.",
              ],
            },
            { p: `Për t'i ushtruar këto të drejta, na shkruani në ${email}.` },
          ],
        },
        {
          id: "changes",
          title: "Ndryshimet e kësaj politike",
          blocks: [
            { p: "Mund ta përditësojmë këtë politikë. Data në krye të faqes tregon versionin aktual." },
          ],
        },
      ],
    },
    terms: {
      title: "Kushtet e përdorimit",
      intro: `Këto kushte vlejnë për përdorimin e kësaj faqeje, që menaxhohet nga ${company.legalName}.`,
      sections: [
        {
          id: "using",
          title: "Përdorimi i kësaj faqeje",
          blocks: [
            {
              p: "Mund ta përdorni këtë faqe për t'u informuar për Dekorfix dhe produktet e saj. Ju lutemi mos e keqpërdorni, për shembull duke tentuar ta ndërprisni ose ta qasni në mënyra për të cilat nuk është krijuar.",
            },
          ],
        },
        {
          id: "product-information",
          title: "Informacioni për produktet",
          blocks: [
            {
              p: "Produktet tona i përshkruajmë sa më saktë që mundemi. Paketimet, shpenzimi dhe detajet e tjera jepen për informim; etiketa e produktit dhe fleta teknike kanë përparësi. Fotot mund të ndryshojnë pak nga produkti i vërtetë.",
            },
          ],
        },
        {
          id: "estimates",
          title: "Vlerësimet dhe mjetet e planifikimit",
          blocks: [
            {
              p: "Kalkulatori i materialit dhe Project Studio japin vlerësime bazuar në shpenzimin mesatar të publikuar. Shpenzimi i vërtetë varet nga sipërfaqja, kushtet dhe mënyra e aplikimit, prandaj vlerësimet nuk janë garanci. Ju lutemi konfirmoni sasitë me ne para porosisë.",
            },
          ],
        },
        {
          id: "offers",
          title: "Ofertat dhe porositë",
          blocks: [
            {
              p: "Asgjë në këtë faqe nuk është ofertë detyruese. Çmimet, disponueshmëria dhe porositë merren vesh drejtpërdrejt me Dekorfix.",
            },
          ],
        },
        {
          id: "intellectual-property",
          title: "Pronësia intelektuale",
          blocks: [
            {
              p: `Emri dhe logoja Dekorfix, emrat e produkteve, tekstet, fotot dhe dizajni i kësaj faqeje i takojnë ${company.legalName} ose përdoren me leje. Nuk mund t'i kopjoni apo ripërdorni pa pëlqimin tonë me shkrim, përveç për përdorim personal e jo komercial.`,
            },
          ],
        },
        {
          id: "links",
          title: "Lidhjet për në faqe të tjera",
          blocks: [
            {
              p: "Kemi lidhje për në shërbime si Google Maps, Facebook dhe Instagram. Nuk jemi përgjegjës për përmbajtjen apo praktikat e tyre.",
            },
          ],
        },
        {
          id: "liability",
          title: "Përgjegjësia",
          blocks: [
            {
              p: "Punojmë që kjo faqe të jetë e saktë dhe e qasshme, por nuk mund të garantojmë që të jetë gjithmonë pa gabime ose pa ndërprerje. Në masën që e lejon ligji, Dekorfix nuk mban përgjegjësi për humbjet që rrjedhin nga përdorimi i kësaj faqeje ose nga mbështetja në informacionin e saj.",
            },
          ],
        },
        {
          id: "law",
          title: "Ligji i zbatueshëm",
          blocks: [{ p: "Këto kushte rregullohen nga ligjet e Republikës së Kosovës." }],
        },
        {
          id: "contact",
          title: "Kontakti",
          blocks: [{ p: `Pyetje për këto kushte: ${email}, ${phone}.` }],
        },
      ],
    },
    cookies: {
      title: "Politika e cookies",
      intro: "Kjo faqe shpjegon çfarë ruan kjo faqe interneti në pajisjen tuaj dhe pse nuk shihni një njoftim për cookies.",
      sections: [
        {
          id: "cookies",
          title: "Cookies",
          blocks: [
            {
              p: "Kjo faqe nuk vendos cookies dhe nuk përdor analitikë apo gjurmues reklamash. Prandaj nuk ka njoftim për cookies.",
            },
          ],
        },
        {
          id: "browser-storage",
          title: "Ruajtja në shfletuesin tuaj",
          blocks: [
            {
              p: "Dy funksione përdorin hapësirën e ruajtjes së vetë shfletuesit tuaj. Të dhënat mbeten në pajisjen tuaj dhe nuk i dërgohen Dekorfix.",
            },
            {
              table: {
                head: ["Emri", "Lloji", "Qëllimi", "Ruhet deri"],
                rows: [
                  [
                    INTRO_KEY,
                    "Ruajtje e sesionit",
                    "Mban mend që animacioni hyrës është shfaqur, që të luhet një herë për vizitë.",
                    "Deri sa të mbyllet skeda ose dritarja e shfletuesit",
                  ],
                  [
                    STUDIO_KEY,
                    "Ruajtje lokale",
                    "Ruan shtëpinë që planifikoni në Project Studio, që të mund t'i riktheheni.",
                    "Deri sa ta fshini në shfletues",
                  ],
                ],
              },
            },
          ],
        },
        {
          id: "fonts-images",
          title: "Fontet dhe fotot",
          blocks: [
            {
              p: "Fontet dhe fotot shërbehen nga vetë kjo faqe. Gjatë shfletimit nuk bëhen kërkesa te shërbime të jashtme fontesh apo fotosh.",
            },
          ],
        },
        {
          id: "third-parties",
          title: "Shërbimet e palëve të treta",
          blocks: [
            {
              p: "Google Maps, Facebook dhe Instagram hapen vetëm kur ndiqni një lidhje për tek to. Më pas zbatojnë politikat e tyre të cookies.",
            },
          ],
        },
        {
          id: "managing",
          title: "Fshirja e të dhënave të ruajtura",
          blocks: [
            {
              p: "Këto të dhëna mund t'i fshini në çdo kohë te cilësimet e shfletuesit, te të dhënat ose hapësira e ruajtjes për këtë faqe. Fshirja e tyre e rikthen Project Studio në gjendjen fillestare.",
            },
          ],
        },
        {
          id: "changes",
          title: "Ndryshimet",
          blocks: [
            {
              p: "Nëse kjo faqe fillon të përdorë cookies ose teknologji të ngjashme, do ta përditësojmë këtë faqe dhe do të kërkojmë pëlqimin tuaj aty ku kërkohet.",
            },
          ],
        },
      ],
    },
  },
};
