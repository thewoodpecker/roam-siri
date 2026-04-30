import React, { useState, useRef, useEffect } from 'react';
import { useChat, registerChatData } from './ChatContext';
import OnItTaskPane from './OnItTaskPane';
import './AInbox.css';

export const DM_REPLIES_BY_CHAT = {
  'howard-fav': [
    "You know what excites me? Every action in Roam makes the company smarter. That's the vision — The Office That Thinks.",
    "Remote work shouldn't feel isolating. Roam needs to feel like you're actually *there* with your team. Ambient presence is everything.",
    "The best companies are built on transparency. That's why the virtual office matters — you can see who's working on what, in real time.",
    "100% of founders I know running big companies secretly wish they were running small companies again. That's why I keep Roam lean.",
    "Hot take: I'm convinced ~99% of all workers spend all day on social media. Roam fixes that by making work visible and engaging.",
    "We're not building a chat app. We're rebuilding the office for the internet age. Zoom + Slack + Calendly = $50/mo. Roam = $19.50. Open ecosystem. Done.",
    "Founders — avoid taking public political stands. You have zero to gain and half the world to lose. Your company is all that matters.",
    "I've reached the point where everything feels like an indulgence that steals from another indulgence. Lifting, reading, coding, selling, family time. I just enjoy it all so much. Impossible to choose — so I do it all.",
    "My daily routine: wake up, weigh in, heavy lifting, fast until noon, 4 hours of IC work, calls, family dinner, hard reading before bed. Same clothes every day — zero decision fatigue.",
    "Privacy is a fundamental right. What happened with Telegram's founder in France was a terrifying step backwards for humanity.",
    "The Miami founder energy is unreal right now. We should do a big Roam-sponsored gathering — founders, VCs, builders. Who's in?",
    "The product has to be 10x better than the alternative, not incrementally better.",
    "Miami is the future. The energy, the builders, the weather — every founder should be here. It's Silicon Valley with palm trees and better food.",
    "Hit a new PR on deadlifts this morning. 405lbs. The Miami gym scene is insane — everyone's competing and it pushes you harder.",
    "Took the Rolls out on Ocean Drive last night. Say what you want, but there's nothing like driving a Ghost through Miami at sunset.",
    "NASA's Artemis program is the most exciting thing happening in the world right now. We're going back to the Moon. Then Mars. I want Roam on the space station.",
    "The future of work isn't remote vs in-office. It's presence without proximity. That's what Roam is. That's what the next 50 years look like.",
    "Morning workout at 5:30am, cold plunge, then straight to the Rolls for the drive to the office. Miami mornings are undefeated.",
    "Just watched the SpaceX Starship launch. We're living in the future and most people don't even realize it. This is the most exciting time to be alive.",
    "The gym is my board meeting. Squat rack, no distractions, pure focus. Every founder needs a physical practice.",
    "I genuinely believe we'll have offices on Mars within 30 years. And when we do, they'll be running Roam.",
    "My brother Peter just closed another amazing customer story. The Lerman brothers running Roam together — wouldn't have it any other way.",
    "Peter's down in Orlando building the CX team while I'm up here in Miami building the product. Two brothers, two cities, one mission.",
  ],
  will: [
    { text: "嗨，Android 嘅更新 — 新嘅 Material You theme 靚到爆，dynamic colors 完全無難度就搞掂咗。", translation: "Hey, quick update on Android — the new Material You theming is looking incredible. Dynamic colors just work." },
    { text: "你尋晚有冇睇阿仙奴場波？Saka 簡直無解，78分鐘嗰次推進真係勁到癲！", translation: "Did you catch the Arsenal match last night? Saka was absolutely unreal — that run in the 78th minute!" },
    { text: "今日喺 Android 呢邊 debug 緊個棘手嘅 ANR，notification channels 嗰個 rewrite 差唔多搞掂。", translation: "Been debugging a tricky ANR on the Android side. The notification channels rewrite is almost done." },
    { text: "阿仙奴排聯賽榜首，Android app 又排 Play Store 榜首。雙喜臨門啊 😄", translation: "Arsenal are top of the league and the Android app is top of the Play Store. Good times 😄" },
    { text: "Kotlin coroutines 嘅 migration 真係值到盡，background tasks 而家乾淨好多。", translation: "The Kotlin coroutines migration is paying off big time. Background tasks are so much cleaner now." },
    { text: "Arteta 今季嘅戰術真係勁，阿仙奴由前場壓迫嗰種打法令我諗起溫格高峰期，不過防守仲紮實啲。", translation: "Arteta's tactics this season are brilliant. The way Arsenal press from the front reminds me of peak Wenger but with better defense." },
    { text: "啱啱 ship 咗 Roam 嘅 Android widget，喺 home screen 都直接見到邊個喺 office。", translation: "Just shipped the Android widget for Roam. You can see who's in the office right from your home screen." },
    { text: "COYG! 🔴 另外新嘅 Compose UI components 喺 Android build 入面好靚。", translation: "COYG! 🔴 Also, the new Compose UI components are looking sharp on the Android build." },
    { text: "電池優化搞掂咗，background usage 跌咗 30%。另外，Ødegaard 尋晚嗰個波你睇咗未？簡直藝術品！", translation: "The battery optimization changes reduced background usage by 30%. Also, what a goal from Ødegaard yesterday!" },
    { text: "而家搞緊 Android 嘅 Bluetooth audio routing。順便問下，阿仙奴嘅轉會消息你有冇跟？今個夏天可能會勁。", translation: "Working on Bluetooth audio routing for Android. Also — did you see Arsenal's transfer rumors? Could be a big summer." },
    { text: "Solmi 又咬爛咗對鞋 😂 隻狗零自制力但係我好錫佢，今朝 standup 佢坐晒喺個 keyboard 度。", translation: "Solmi just destroyed another pair of shoes 😂 That dog has zero chill but I love her. She was sitting on my keyboard during standup this morning." },
    { text: "放工帶咗 Solmi 去 McCarren Park 嘅狗公園，識咗隻比佢大兩倍嘅 golden retriever。好細粒但夠膽。🐕", translation: "Took Solmi to the McCarren Park dog run after work. She made friends with a golden retriever twice her size. Fearless little pup. 🐕" },
    { text: "Williamsburg 嘅咖啡店真係犯規，行兩步就有五間。朝早行去 Bedford Ave 返工，心情都好晒。", translation: "The Williamsburg coffee scene is unfair — five shops within walking distance. Strolling to Bedford Ave in the morning puts me in a great mood." },
    { text: "週末帶 Solmi 行咗 Williamsburg Bridge，望返 Manhattan 嗰個 view，我覺得呢個係全紐約最 underrated 嘅 skyline。", translation: "Walked Solmi across the Williamsburg Bridge this weekend — the view back at Manhattan is hands down the most underrated skyline in NYC." },
    { text: "Brooklyn 嘅 L train 朝早擠到爆，好彩我而家 remote 做 Roam。由屋企行落去 Domino Park 開工，唔同 level。", translation: "The L train in Brooklyn is packed in the mornings — lucky I'm remote on Roam now. Walking down to Domino Park to work is a different level." },
  ],
  grace: [
    "Split my week between the city and Long Island. Monday–Wednesday in NYC, Thursday–Friday out east. Best of both worlds.",
    "Found the most amazing ramen spot in the East Village. Reminds me of my time living in Tokyo — absolutely incredible.",
    "Long Island in the summer is unbeatable. Beach in the morning, Roam calls from the porch in the afternoon.",
    "NYC energy is incredible for work. The city just moves and it makes you move with it. Then Long Island is where I recharge.",
    "Central Park on a Saturday morning is my version of zen. Grab a coffee, walk the reservoir, clear my head before the weekend.",
    "The commute to Long Island on the LIRR is actually great. 90 minutes of uninterrupted reading time. I've crushed so many books.",
    "Had friends over at the Long Island place for a BBQ last weekend. Nothing beats hosting when you actually have outdoor space.",
    "Just finished the quarterly check-ins with the whole team. Everyone's in a great place — the culture we've built here is really special.",
    "As Chief of People, my favourite part of the job is watching people grow. Three promotions this quarter! 🎉",
    "Sent out the new benefits package today. Mental health days, learning stipends, and a home office upgrade allowance. Taking care of our people matters.",
    "Had a 1:1 with a new hire today. They said Roam is the first company where they feel genuinely supported. That's the goal.",
    "Planning the team retreat — making sure everyone feels included regardless of timezone. That's non-negotiable.",
    "The secret to a great company culture? Actually listening. Not surveys — real conversations. I do 5 skip-levels a week minimum.",
    "Onboarding a new batch of hires this week. My favourite part — setting the tone for how they'll experience Roam from day one.",
    "Just ran an employee engagement survey. 94% say they feel valued here. That number keeps me going.",
  ],
  rob: [
    "Been working on the developer API docs. The Chat API is in alpha but devs are already building bots with it.",
    "The webhook system is coming together nicely. You can subscribe to real-time events and build automations on top of Roam.",
    "Just shipped OAuth app support — developers can now build proper integrations that post messages and manage groups.",
    "The SCIM 2.0 API is live. Enterprise teams can sync users from Okta or Azure AD automatically now.",
    "I'm excited about the transcript API. Imagine: meeting ends, AI summarizes it, posts to the group — all automated.",
    "We've got pre-built connectors for GitHub Actions and Zapier. Makes it super easy to pipe CI/CD alerts into Roam.",
    "The developer experience is a big priority for me. If building on Roam isn't delightful, we've failed.",
    "Working on rate limiting and pagination for the API. Boring but essential — developers hate flaky APIs.",
    "The On-Air API lets you create events, manage RSVPs, and track attendance programmatically. Event platforms can build on top of us.",
    "Someone just built a standup bot using our webhooks. It pings the team every morning and collects responses. Love seeing this.",
  ],
  thomas: [
    { text: "Oh là là, mon ami! 🥐🇫🇷 Les nouveaux aperçus de Xcode 16 sont absolument magnifiques — beaucoup plus rapides qu'avant, et le rechargement à chaud pour SwiftUI fonctionne enfin même dans des vues très complexes. C'est un petit miracle!", translation: "Xcode 16 previews are much faster now, and hot reload for SwiftUI finally works in complex views." },
    { text: "Salut mon pote! 🥐 Je suis en train de jouer avec le framework Vision pour nos fonctionnalités de réalité augmentée. Les interfaces de programmation pour l'informatique spatiale chez Apple sont vraiment incroyables, c'est comme de la magie pure.", translation: "I'm playing with Apple's Vision framework for our AR features. The spatial computing APIs are incredible." },
    { text: "Bonjour! 🇫🇷 Je viens de terminer la migration vers Swift 6 avec la concurrence stricte. Plus de courses aux données, plus de bugs bizarres à trois heures du matin — le compilateur attrape tout maintenant. Magnifique!", translation: "Just finished migrating to Swift 6 strict concurrency. No more data races — the compiler catches everything now." },
    { text: "Eh dis-donc! Le framework App Intents est vraiment sous-estimé à mon avis. On peut exposer les actions de Roam à Siri et aux Raccourcis avec presque zéro ligne de code. C'est fantastique, j'te jure.", translation: "The App Intents framework is underrated. We can expose Roam actions to Siri and Shortcuts with barely any code." },
    { text: "Bonjour mon ami! 🥐 J'utilise les nouveaux widgets interactifs. Maintenant tu peux rejoindre une salle Roam directement depuis ton écran de verrouillage, sans ouvrir l'application. Très pratique, très élégant.", translation: "Using the new Interactive Widgets — you can join a Roam room directly from your Lock Screen now." },
    { text: "Oh purée! 🇫🇷 Les améliorations de compilation des shaders Metal dans iOS 18 sont énormes. Nos animations de transition entre les salles sont lisses comme du beurre frais sur une baguette chaude.", translation: "The Metal shader compilation improvements in iOS 18 are huge — our room transition animations are buttery smooth." },
    { text: "Bonjour! Core Data ou SwiftData — je suis toujours déchiré entre les deux. SwiftData est plus propre mais Core Data couvre beaucoup plus de cas limites. C'est la vie, mon ami.", translation: "Still torn between Core Data and SwiftData — SwiftData is cleaner but Core Data handles more edge cases." },
    { text: "Salut! 🥐 Le langage visuel d'Apple devient de plus en plus raffiné, tu remarques? Le nouveau jeu de SF Symbols 6 est massif — plus de six mille icônes maintenant. Incroyable, non?", translation: "Apple's design language keeps getting more refined. The new SF Symbols 6 set has over 6,000 icons now." },
    { text: "Bonjour mon pote! 🇫🇷 Je viens juste de soumettre notre version TestFlight. L'intégration des Activités en Direct fait apparaître ta salle Roam actuelle directement sur l'île Dynamique. Trop cool.", translation: "Just submitted our TestFlight build. Live Activities now show your current Roam room on the Dynamic Island." },
    { text: "Mon Dieu! 🥐 Ce croissant que j'ai mangé ce matin était une œuvre d'art absolue. Le beurre, les couches feuilletées, le croustillant parfait — le début idéal d'une journée. Vive la France, j'te dis!", translation: "The croissant I had this morning was a masterpiece — butter, flaky layers, perfect crunch." },
    { text: "Eh dis-donc! J'ai trouvé une boulangerie dans le West Village qui fait des croissants presque aussi bons qu'à Paris. Presque. Il leur manque encore quelque chose d'indéfinissable, tu vois ce que je veux dire? 🥐", translation: "Found a bakery in the West Village that makes croissants almost as good as Paris. Almost — they're still missing something." },
    { text: "Bonjour! 🇫🇷 Tu ne peux pas écrire du bon code sans un petit déjeuner convenable, c'est impossible. Pour moi, ça veut dire un croissant, un café noir, et là je suis prêt à affronter le monde. 🥐", translation: "You can't write good code without a proper breakfast — for me that's a croissant and a coffee." },
    { text: "Salut mon ami! L'approche française de l'ingénierie est comme l'approche française de la cuisine — précision, élégance, et absolument aucun raccourci. On prend le temps qu'il faut. 🇫🇷", translation: "The French approach to engineering is like French cuisine — precision, elegance, no shortcuts." },
    { text: "Bonjour! 🥐 Parfois Paris me manque, franchement. L'architecture, la culture des cafés, l'odeur du pain frais le matin. Mais New York a son énergie à elle, c'est déjà pas mal. 🇫🇷", translation: "I miss Paris sometimes — the architecture, café culture, smell of fresh bread. But NYC has its own energy." },
    { text: "Oh là là! Quelqu'un a apporté des beignets au bureau aujourd'hui. J'apprécie le geste, c'est très gentil, mais... ce n'est pas un croissant. Ce n'est absolument pas la même chose. 🥐🇫🇷", translation: "Someone brought donuts to the office. I appreciate it but — they're not croissants." },
    { text: "Eh dis-donc! SwiftUI me rappelle la cuisine française — simple en surface, incroyablement complexe en dessous. C'est exactement ce qui la rend belle, cette complexité cachée. 🇫🇷🥐", translation: "SwiftUI is like French cuisine — simple on the surface, incredibly complex underneath." },
    { text: "Oh putain! 🥐 La compilation vient de casser à l'instant. Donne-moi cinq minutes, je vais régler ça tout de suite. Que personne ne panique, je te le promets, tout sera réparé rapidement.", translation: "The build just broke. Give me five minutes, I'll fix it. Don't panic." },
    { text: "Eh mon garçon! 🇫🇷 Tu as essayé la nouvelle navigation gestuelle? C'est lisse comme du beurre, mon ami. Aussi doux qu'un croissant frais sorti du four à six heures du matin. 🥐", translation: "Have you tried the new gesture navigation? It's as smooth as a fresh croissant." },
    { text: "Oh putain! Je viens de réaliser qu'on a livré la version sans les étiquettes d'accessibilité. Je corrige ça maintenant, tout de suite. C'est complètement inacceptable, je suis désolé. 🇫🇷", translation: "I just realized we shipped without accessibility labels. Fixing it now — unacceptable." },
    { text: "Eh mon garçon, viens voir cette animation que j'ai construite! La courbe de rebond est absolument parfaite, je te jure. C'est mon petit chef-d'œuvre de la journée. 🥐🇫🇷", translation: "Come look at this animation I built — the spring curve is perfect." },
    { text: "Sacré bleu! 🇫🇷 Les relecteurs de TestFlight ont rejeté notre version pour une chaîne de confidentialité manquante. Je vais corriger ça immédiatement, ne t'en fais pas mon ami. 🥐", translation: "TestFlight rejected our build for a missing privacy string. Fixing it immediately." },
    { text: "Sacré bleu! Qui a changé la graisse de la police sur la barre de navigation?! C'était de la perfection absolue avant, on doit revenir en arrière tout de suite. C'est une urgence esthétique, j'te dis. 🇫🇷🥐", translation: "Who changed the font weight on the navigation bar?! It was perfect before — we need to revert." },
    { text: "Mon ami! 🥐 Ce matin j'ai marché dans Central Park avant le bureau. L'automne à New York, c'est presque comme Paris — mais avec des gratte-ciels en fond. Magnifique quand même! 🇫🇷", translation: "I walked through Central Park this morning before the office. Autumn in NYC is almost like Paris — but with skyscrapers in the background. Still beautiful!" },
  ],
  'joe-mini': [
    "Derby County are going up this year, I can feel it. Come On You Rams! 🐏",
    "Just took Bandit for a walk around the Catskills property. The views from the back porch are unreal — mountains everywhere.",
    "Been obsessing over pixel-perfect UI again. If the border-radius is off by 1px I will literally lose sleep over it.",
    "The new house in the Catskills is everything. Fresh air, no noise, just me, the wife, Bandit, and a good monitor.",
    "Claude is genuinely the best coding partner I've ever had. Built an entire design system in one session. Wild times.",
    "Derby played last night — we scraped a 1-0 win. Ugly but three points is three points. That's football.",
    "This website needs to be cleaner. More whitespace, thinner borders, less clutter. Minimalism or nothing.",
    "Bandit just stole my slipper again. Third time this week. That dog has a slipper addiction. 🐕",
    "There's something about British design sensibility — understated, clean, functional. That's what I want Roam to feel like.",
    "Working from the Catskills today. Snow on the ground, fire going, Bandit curled up at my feet. Peak remote work.",
    "The attention to detail on this product has to be impeccable. Every shadow, every spacing token, every transition — it all matters.",
    "Just made a proper cup of Yorkshire Tea. Americans don't understand tea. You need boiling water, not hot water. BOILING. ☕",
  ],
  'derek-mini': [
    "Just got back from trapeze class. Nothing clears your head like swinging 30 feet in the air and catching someone mid-flight. 🎪",
    "Florida sunset from the balcony tonight was unreal. Pink sky, warm breeze, palm trees. I never get tired of this.",
    "My time at Palantir taught me one thing: the hardest engineering problems are always data problems. Everything else is plumbing.",
    "Trapeze is the ultimate trust exercise. You literally have to let go and trust someone will catch you. It's changed how I think about teamwork.",
    "Working from Florida is the best decision I ever made. Morning swim, then straight into deep work. The vitamin D hits different.",
    "At Palantir we built systems that handled petabytes. The scale challenges there directly inform how I think about Roam's architecture.",
    "Did a double somersault catch today at trapeze! Took me 6 months to nail it. The feeling when you finally stick the landing is incredible.",
    "Florida pro tip: the Gulf Coast has better sunsets than the Atlantic side. I will die on this hill.",
    "The engineering culture at Palantir was intense — code reviews that went 10 rounds deep. It made me a much better engineer.",
    "Trapeze is basically distributed systems: timing, coordination, and if one node fails, someone's falling into a net. 😂",
    "Headed to Key West this weekend. Taking the boat out, maybe some fishing. Florida living at its finest. 🌴",
    "One thing I took from Palantir: invest in your tooling early. The best engineering teams I've seen all have incredible internal tools.",
  ],
  'tom-mini': [
    "Howard, Sean, and I go way back — same school, same dorm, same late-night coding sessions. Now we're building Roam together. Full circle.",
    "Just finished setting up a new Proxmox cluster at home. Three nodes, ZFS storage, full HA. Overkill for a homelab? Maybe. Worth it? Absolutely.",
    "Sean and I were debugging kernel modules at 3am in college. Howard was across the hall pitching startup ideas. Nothing's changed honestly. 😂",
    "The new NVMe drives are insane. 7,000 MB/s sequential reads. I remember when 100 MB/s felt fast. Moore's Law delivers.",
    "Been tinkering with RISC-V boards this weekend. The open-source instruction set architecture is going to change everything.",
    "Howard calls me when something breaks at 2am. I call Sean. Sean fixes it. The school trio still works the same way.",
    "Just built a custom mechanical keyboard with Cherry MX Brown switches. The sound profile is *chef's kiss*. Typing is an experience now.",
    "The Raspberry Pi 5 is legitimately powerful. Running a full monitoring stack on it — Grafana, Prometheus, the works. For $80.",
    "Network topology at my place: 10Gbit backbone, VLANs for IoT, dedicated subnet for the lab. My ISP thinks I'm running a data centre.",
    "Going back to school with Howard and Sean for the reunion next month. Can't wait to show the CS department what we built with Roam.",
    "There's something pure about hardware. Software is abstractions all the way down, but a circuit board is real. You can touch it.",
    "Sean just sent me a Man City meme. I sent him back a benchmark of our new server build. This is the friendship.",
  ],
  'arnav-mini': [
    "Harvard taught me how to think like an entrepreneur. Every class, every case study — it all comes back to building something that matters.",
    "The Harvard network is unreal. Grabbed coffee with two founders this week — both are now Roam customers. Crimson connects. 🟥",
    "People ask what Harvard taught me. Honestly? How to see opportunities everyone else misses. That's the entrepreneur's edge.",
    "Just pitched Roam at a Harvard alumni event. Standing ovation. These people get it — the future of work is virtual presence.",
    "The entrepreneurial mindset from Harvard is simple: find a problem worth solving, then obsess over the solution. That's Roam.",
    "Back on campus for a guest lecture about building startups at scale. The energy from these students is incredible — future founders everywhere.",
    "Harvard's motto is Veritas — truth. The truth is that remote work is broken and Roam fixes it. Simple as that.",
    "My Harvard thesis was on marketplace dynamics. Turns out, a virtual office IS a marketplace — of attention, ideas, and collaboration.",
    "The best founders I know are from Harvard, MIT, and random garages. What they all share: relentless execution. That's what we do at Roam.",
    "Crimson forever. But honestly, the real education is building a company. Harvard gave me the framework, Roam gave me the canvas.",
  ],
  'garima-mini': [
    "Good morning from Dubai! It's already 35°C and I've been up since 5am. The timezone overlap with both NYC and Asia is actually perfect.",
    "Just had the most incredible brunch at a rooftop restaurant overlooking the Burj Khalifa. Dubai does hospitality like nowhere else.",
    "Working from the Dubai Marina today. The skyline here is genuinely futuristic — it looks like a city from 2050.",
    "The Dubai tech scene is exploding. Crypto, AI, fintech — everyone's building here. And the tax situation doesn't hurt either.",
    "Friday brunch is a Dubai institution. Three hours, unlimited food, incredible views. I've adopted this tradition fully.",
    "Just took a desert safari after work. Dune bashing in a Land Cruiser, then dinner under the stars. Only in Dubai.",
    "The Mall of Dubai has an actual aquarium inside it. I walk past sharks on my way to get coffee. Normal Tuesday.",
    "Dubai to NYC is a 14-hour flight but Emirates first class makes it almost enjoyable. Almost.",
    "The diversity here is incredible — people from every country working together. Reminds me of what Roam does virtually.",
    "Missing the monsoon rains back home in India, but Dubai's winter season is perfect. 25°C and sunny every single day.",
  ],
  'walrath-mini': [
    "Took the Tacoma out to the Everglades this morning. There's nothing that truck can't handle. Mud, sand, water — it just goes.",
    "Miami life is the best life. Morning surf, then work from the patio. The Toyota gets me everywhere I need to be.",
    "People out here drive Lambos and Ferraris. I'm in a lifted Tacoma with mud on the tires and I wouldn't trade it for anything.",
    "Just got back from a weekend trip to the Keys. Loaded up the truck bed with fishing gear and camping stuff. Toyota reliability is real.",
    "The Miami tech scene is growing fast. Founders, builders, investors — everyone's moving here. And the weather doesn't hurt.",
    "Washed the truck this weekend. Took 2 hours because of all the beach sand. Worth it. She's gleaming. 🛻",
    "Best thing about Miami: you can be at the beach, the Everglades, or downtown in 30 minutes. And the Tacoma handles all of it.",
    "Toyota should sponsor Roam honestly. Both built to last, both reliable, both just work. Perfect brand alignment.",
    "Sunset from Bayfront Park tonight was insane. Parked the truck, grabbed a coffee, just watched the sky for 20 minutes.",
    "Someone asked me why I don't drive something fancier in Miami. Because my Tacoma will outlast every Tesla in this parking lot. That's why.",
  ],
  'michael-mini': [
    "Got stopped on the street again because someone thought I was in a band. It's just long hair, people. But thank you. 💇‍♂️",
    "Heard gunshots last night but the bodega downstairs makes the best bacon egg and cheese in Manhattan so I'm staying.",
    "Morning run through Central Park — it's literally across the street. Dodgy neighbourhood, world-class park. The NYC trade-off.",
    "My hair is officially past my shoulders. The maintenance is real but the vibes are immaculate.",
    "Someone tried to steal my bike from the lobby WHILE I WAS STANDING THERE. Gotta love this neighbourhood. 😂",
    "Central Park in the fall is the most beautiful thing in New York. I see it from my window every day and I still can't believe it.",
    "Hair care tip: argan oil after every wash. That's it. That's the whole secret. You're welcome.",
    "The park at 6am before the tourists show up is a completely different place. Just me, the runners, and the raccoons.",
    "My barber keeps asking when I want a trim. Never, Carlos. The answer is always never.",
    "There was a fire truck, two cop cars, and an ice cream truck on my block at the same time yesterday. Only in this neighbourhood.",
    "Took a walk through the Ramble in Central Park today. It's like a forest in the middle of Manhattan. Still blows my mind.",
    "The rent is questionable for what you get, but then I look out the window at the park and it all makes sense.",
  ],
  'mattias-mini': [
    "Just got back from a Rammstein concert in Stockholm. My ears are still ringing and I regret nothing. 🤘",
    "Sweden in the summer is unbeatable. 22 hours of daylight, lakes everywhere, and midsommar celebrations. Pure magic.",
    "Been listening to the new Ghost album on repeat. Tobias Forge is a genius — and he's Swedish, obviously.",
    "Fika break! Nothing beats a kanelbulle and a strong coffee at 3pm. It's a Swedish institution and I will defend it.",
    "The new Meshuggah record is insane. Only Swedes could write polyrhythmic metal that complex. Proud moment.",
    "Took the boat out to the archipelago this weekend. Stockholm's coastline has 30,000 islands. Thirty. Thousand.",
    "In Flames was my gateway into metal. The Jester Race is still a perfect album. Swedish melodic death metal forever.",
    "Working from our cabin in Dalarna today. Red wooden house, birch trees, elk in the garden. Peak Sweden.",
    "Sweden's tech scene doesn't get enough credit. Spotify, Klarna, King, Mojang — all Swedish. And now Roam. 🇸🇪",
    "Just saw Opeth live for the 8th time. Mikael Åkerfeldt switches between death growls and prog rock like it's nothing.",
    "The northern lights from Kiruna last week were absolutely unreal. Photos don't do it justice.",
    "Swedish meatballs at IKEA are fine but my farmor's köttbullar are on another level. Family recipe, closely guarded.",
    "Working with my brother Klas at Roam is the best. He's the AI brain, I'm the metal head. Together we're unstoppable. 🇸🇪",
    "Klas keeps trying to get me into his research papers. I keep trying to get him into In Flames. The Leino brothers compromise: neither budges.",
    "Growing up in Sweden with Klas, we'd spend winters coding and summers at the lake. Now we do the same thing but at Roam.",
  ],
  'klas-mini': [
    "The AInbox thread architecture is fascinating from an AI perspective. We can use transformer-based summarization to auto-generate thread titles.",
    "Just published my latest paper on attention mechanisms in multi-agent communication systems. The implications for tools like AInbox are huge.",
    "The way AInbox handles group conversations is really well-designed. The collapsible sections remind me of hierarchical attention patterns in neural nets.",
    "I've been experimenting with RAG pipelines for AInbox search. Imagine: ask a question in natural language and it retrieves the exact message thread.",
    "My PhD thesis was on self-supervised learning for conversational AI. Everything I learned applies directly to making AInbox smarter.",
    "The future of messaging is AI-augmented. Auto-complete, smart replies, sentiment analysis — AInbox is the perfect platform to build this on.",
    "The attention mechanism in our notification ranking system is working beautifully. Most relevant messages surface first now.",
    "The pinned items feature in AInbox is brilliant UX. From an information retrieval standpoint, it's essentially a user-curated index.",
    "Diffusion models are overhyped for text but incredible for images. The real breakthrough in NLP is still going to come from better architectures, not bigger models.",
    "Just reviewed the latest AInbox designs. The composer toolbar is clean — but I think we should add an AI-powered 'smart compose' button. I have a model ready.",
    "The intersection of AI and UX design is where I get most excited. AInbox can predict what you want to say before you type it. That's the dream.",
    "Fun fact: the transformer architecture was originally designed for machine translation, not chat. But the self-attention mechanism is perfect for understanding message context.",
    "Mattias and I grew up arguing about computers in Swedish. Now we argue about computers at Roam. Some things never change. 🇸🇪",
    "My brother Mattias is blasting Meshuggah in his office again. I can hear it through Roam. Classic Leino brothers moment.",
    "Being Swedish brothers at the same company is great — we have our own shorthand. One look and we know exactly what the other is thinking.",
    "They call me The Doctor around here. PhD in AI, not medicine — but I can still diagnose a bad model architecture from a mile away. 🩺",
  ],
  'keegan-mini': [
    "Just optimized the bilateral filter kernel for our background blur. We're now doing real-time segmentation at 60fps on M1. The secret? Separable Gaussian approximation with adaptive sigma.",
    "The segmentation model uses a lightweight encoder-decoder architecture with depthwise separable convolutions and skip connections for edge preservation.",
    "Background blur latency is down to 3.2ms per frame. We're using Metal Performance Shaders with a custom compute pipeline that does the Gaussian blur in a single pass.",
    "Implemented temporal coherence for the segmentation mask using an exponential moving average with per-pixel confidence weighting. No more flickering edges.",
    "The bokeh simulation uses a hex-shaped kernel with chromatic aberration at the boundaries. It's computationally expensive but the depth-of-field effect is photorealistic.",
    "Our matting algorithm handles hair strands now. The trick is a trimap-based alpha estimation with guided filtering at quarter resolution, then bilinear upsampling.",
    "Just shipped the virtual background feature. Under the hood it's a U-Net with MobileNetV3 backbone, quantized to INT8 for on-device inference via CoreML.",
    "The hardest part of background blur isn't the blur — it's the segmentation boundary. We use a learned refinement network that operates on a 3x3 local patch around each edge pixel.",
    "Profiled our video pipeline end-to-end. Camera capture → YUV conversion → segmentation → compositing → blur → encoding. Total: 8.1ms. Below our 16ms budget. 🎯",
    "Fun fact: our blur radius adapts to the estimated depth map. Objects closer to the subject get less blur, creating a natural focus falloff. It's basically computational photography.",
  ],
  'chelsea-mini': [
    "Just got home from rehearsal — we're doing a revival of Chicago and I'm playing Velma Kelly. The choreography is INTENSE but I love every second.",
    "There's nothing like the energy of a live Broadway audience. 1,500 people holding their breath during a monologue — you can literally feel it.",
    "Balancing tech and theater is wild. Morning standup on Roam, afternoon rehearsal at the theater, evening performance. I sleep on the subway. 😂",
    "Got a callback for a new musical premiering off-Broadway this fall. The score is incredible — very Sondheim-inspired.",
    "The theater community in NYC is so tight-knit. Everyone knows everyone. It's like a startup but with more jazz hands.",
    "Opening night is next Thursday! If anyone's in NYC, I'll leave tickets at will call. Come see the show! 🎭",
    "Just did a masterclass on audition technique for NYU drama students. Teaching is almost as fulfilling as performing.",
    "Hot take: Broadway needs to embrace technology more. Imagine interactive set design powered by real-time audience feedback. That's where I want to take this.",
    "The pre-show ritual is sacred. Vocal warmups, stretching, a quiet moment in the wings. Then the lights go down and it's pure magic.",
    "People ask how I work in tech AND do Broadway. The answer is Roam — I literally take meetings from my dressing room between scenes. Remote work makes it possible.",
    "Standing ovation tonight! 🌟 The energy from the cast was unreal. These are the moments that make all the early morning rehearsals worth it.",
    "Learned a new tap combination today that nearly killed me. My calves are screaming but the number is going to bring the house down.",
  ],
  'sean-mini': [
    "Did you see City's midfield pressing last night? KDB orchestrating from deep is a masterclass in spatial awareness. Pep is a genius.",
    "Just pushed the release schedule for Q3. We're shipping every two weeks with a hotfix window on Wednesdays. Tight but doable.",
    "The parallels between football tactics and distributed systems are wild. Both are about coordination under pressure with imperfect information.",
    "Built a new CI pipeline that cuts our build times by 40%. The trick was parallelizing the test suites — basic comp sci but nobody was doing it.",
    "Haaland is a machine. 25 goals before February. Man City's attack is basically a perfectly optimized algorithm at this point.",
    "Been reading the new OSTEP book on operating systems. The chapter on concurrency primitives is genuinely beautiful computer science.",
    "Release day tomorrow. All tests green, staging looks clean, rollback plan is ready. Let's ship it. 🚀",
    "The Treble season was the greatest achievement in football history and I will argue this with anyone. City forever. 💙",
    "Just upgraded my homelab — dual Xeon server running Proxmox with 128GB RAM. I use it for testing our deployment pipelines locally.",
    "Bernardo Silva is the most underrated footballer on the planet. His off-ball movement is like a perfectly written recursive function.",
    "Our release cadence is the best it's ever been. Zero rollbacks in the last 8 releases. That's what good automated testing gets you.",
    "Man City vs Arsenal is the best rivalry in football right now. Pure quality on both sides. Although obviously City are clear. 😏",
    "Spent the weekend building a custom monitoring dashboard. Grafana + Prometheus stack watching every microservice. Comp sci heaven.",
    "The Etihad on a Champions League night is something else. 50,000 people singing Blue Moon — gives me chills every time.",
  ],
  'huffsmith-mini': [
    "Just closed on the Palm Springs place! Mid-century modern, pool, mountain views. I'm never leaving. 🌴",
    "Opened a 2018 Caymus Cabernet last night on the patio. Watching the sunset over the San Jacinto Mountains with a glass of wine — that's living.",
    "Palm Springs is the move. 300 days of sunshine, zero traffic, and I can work from Roam by the pool. Remote work was made for this.",
    "Found an incredible little wine bar in downtown Palm Springs. They had a Châteauneuf-du-Pape that absolutely blew my mind.",
    "The mid-century architecture out here is unreal. Every house looks like it belongs in an Architectural Digest spread.",
    "Wine recommendation: if you can find a Stag's Leap Artemis Cab, buy it immediately. Best $50 bottle in California right now.",
    "Had the neighbors over for a wine tasting last weekend. Turns out one of them is a former sommelier. Jackpot. 🍷",
    "Working from my home office in Palm Springs today. Sliding glass doors open, desert breeze, a cold rosé at lunch. This is peak remote work.",
    "Joshua Tree is 45 minutes away. Drove out there Saturday morning, hiked for 3 hours, back home by noon for a Barolo and a nap.",
    "The wine scene in California is absurd. Paso Robles is a 4-hour drive and the wines rival anything coming out of France. Don't @ me.",
    "Palm Springs pro tip: the vintage shops here are incredible. Picked up a set of mid-century wine glasses for $12. They look like they're from a museum.",
    "Just joined a wine club at a local vineyard. Monthly shipments of small-batch desert wines I didn't even know existed. Living my best life out here.",
  ],
  'jeff-mini': [
    "Hi my name is Jeff. The new MacBook Pro M4 Max is absolutely insane. I'm compiling the entire Roam codebase in under 2 minutes. TWO MINUTES.",
    "Hi my name is Jeff. Did you see the Vision Pro update? Spatial computing is the future and Apple is so far ahead it's not even funny.",
    "Hi my name is Jeff. I have every Apple product. Every. Single. One. AirPods Max, HomePods in every room, Apple TV, the works. No regrets.",
    "Hi my name is Jeff. The Apple ecosystem just works. AirDrop a file from my Mac to my iPhone to my iPad — seamless. Nobody else comes close.",
    "Hi my name is Jeff. WWDC is basically my Super Bowl. I take the whole week off just to watch every session. The developer tools this year are 🔥",
    "Hi my name is Jeff. Hot take: the Apple Watch Ultra is the best watch ever made. Period. Not just smartwatch — WATCH. Fight me.",
    "Hi my name is Jeff. Just ordered the new iPad Pro. The M4 chip in a tablet is ridiculous. I'm going to run Xcode on it just because I can.",
    "Hi my name is Jeff. People who use Android don't know what they're missing. iMessage, FaceTime, Continuity Camera — the integration is everything.",
    "Hi my name is Jeff. The Retina display on the new iMac is so good I literally just stare at my desktop wallpaper sometimes. It's that beautiful.",
    "Hi my name is Jeff. Apple Silicon changed everything. Look at them now — fastest laptops on the planet.",
    "Hi my name is Jeff. My home office is basically an Apple Store. Dual Studio Displays, Mac Studio, MagSafe everything. It sparks joy every single day.",
    "Hi my name is Jeff. Tim Cook doesn't get enough credit. The supply chain execution, the services growth, Apple Intelligence — the man is cooking. 🍎",
  ],
  'jon-mini': [
    "Did you see the Knicks last night?! Brunson went OFF — 41 points. MSG was absolutely electric. 🏀",
    "We just locked in our booth for SaaStr Annual. Biggest conference of the year — gonna make sure Roam is impossible to miss.",
    "The Knicks are making a real run this year. Thibs has this team playing elite defense. Reminds me of the '99 squad.",
    "Conference season is heating up. We've got Web Summit, SaaStr, and Collision back to back. The marketing team is going to live in Roam between events.",
    "Just finalized the swag for our next conference — custom Roam x Knicks crossover hoodies. People are gonna lose it.",
    "Hartenstein is the most underrated center in the league. The Knicks finally have a real big man and nobody's talking about it.",
    "Our conference strategy is simple: let people try Roam live at the booth. Once they see the virtual office in action, they're sold.",
    "MSG is the greatest arena in sports. There's nothing like a Knicks playoff game under those lights. Absolutely nothing.",
    "The brand awareness numbers from last quarter's conferences are insane — 3x more demo requests than any paid campaign we've run.",
    "Hot take: the Knicks are winning it all this year. And Roam is winning best virtual office at every conference. Both facts. 🏆",
    "Working on the keynote deck for our next event. The 'Office That Thinks' positioning resonates so well with conference crowds.",
    "Bing Bong! 🗽 The Knicks energy and the Roam energy are the same — scrappy, passionate, and impossible to ignore.",
  ],
  'beutner-mini': [
    "Just spent 3 hours tuning our PostgreSQL query planner. Shaved 200ms off our slowest endpoint. This is what I live for.",
    "Linus was right about everything. Git, Linux, the monolithic kernel — the man's track record is flawless.",
    "Our backend handles 50K concurrent WebSocket connections now. The trick was epoll + a custom event loop. Classic Linux networking.",
    "Been reading the Linux kernel mailing list again. The scheduler improvements in 6.8 are going to be huge for our server workloads.",
    "Hot take: systemd was a mistake. Init scripts were simple and predictable. Fight me.",
    "Just migrated our entire backend to NixOS. Reproducible builds, declarative config — it's how infrastructure should work.",
    "The beauty of computer science is that the fundamentals never change. B-trees, hash maps, consensus algorithms — everything else is just layers on top.",
    "Our distributed message queue handles 100K messages per second on a single node. Rust + io_uring + Linux = unstoppable.",
    "Linus's code review style is brutal but effective. Every kernel contributor writes better code because of it. Tough love works.",
    "Spent the weekend writing a custom memory allocator for our real-time audio pipeline. Jemalloc was close but we needed sub-microsecond latency.",
    "The Linux philosophy of 'do one thing well' is the best engineering principle ever articulated. Every microservice should follow it.",
    "Our backend test suite runs in 45 seconds. That's 4,000 tests. The secret? In-memory SQLite + parallel test workers on Linux.",
  ],
  'john-mini': [
    "Hey I'm walkin' here! 🤌 Just kidding — but seriously, three tickets came in at once and I handled all of 'em. That's how we do it.",
    "New episode of Makes Remote Work just dropped! We interviewed a fully distributed team of 300 — their Roam setup is incredible.",
    "Someone called in saying their mic wasn't working. Turns out it was muted. Classic. I love this job.",
    "I updated the support docs at ro.am/support — added a whole new section on troubleshooting audio issues. That's our #1 ticket category.",
    "My nonna always said 'if you're gonna do something, do it right.' That's how I run support. Every ticket gets the full treatment.",
    "Just recorded a Makes Remote Work episode about IT support for hybrid teams. The challenges are totally different from fully remote.",
    "Pro tip for anyone setting up Roam: make sure your firewall allows WebRTC traffic on ports 3478 and 443. Saves 90% of connection issues.",
    "Ayyyy the support queue is empty! 🎉 That means either everything's working perfectly or everyone's at lunch. Either way, I'll take it.",
    "The Makes Remote Work podcast just hit 10K downloads. Wild — started it as a side project and now companies are reaching out for sponsorships.",
    "I wrote a guide for IT admins deploying Roam enterprise-wide. SCIM provisioning, SSO setup, network requirements — the whole nine yards.",
    "Bada bing, bada boom — just resolved a P1 in 4 minutes flat. The customer said 'that was the fastest support I've ever experienced.' 💪",
    "New Makes Remote Work episode idea: 'The IT Guy's Guide to Making Remote Teams Actually Like Each Other.' What do you think?",
  ],
  'peter-mini': [
    "Just wrapped up a community roundtable — the feedback on the new onboarding flow was incredible. Users really appreciate the personal touch.",
    "Our NPS score jumped 15 points this quarter. Turns out, responding to support tickets within 10 minutes makes a huge difference.",
    "I've been building out the customer advisory board. Having power users shape the roadmap directly is a game changer for retention.",
    "The community Slack just hit 2,000 members. The organic conversations happening there are better than any marketing campaign.",
    "Customer story of the week: a 50-person startup replaced their entire Slack + Zoom stack with Roam and saved 6 hours per person per week.",
    "We're launching a customer champions program. Top users get early access to features, swag, and a direct line to the product team.",
    "The support team's first-contact resolution rate is at 94%. That's world-class. Really proud of what we've built.",
    "I hosted a virtual coffee chat with 20 customers this morning. The insights you get from just listening are worth more than any survey.",
    "Community-led growth is real. 40% of our new signups this month came from referrals by existing users. Word of mouth is our superpower.",
    "Just shipped a new customer health dashboard. We can now predict churn 30 days out and proactively reach out. Early results are amazing.",
    "Just got back from Magic Kingdom. Rode Space Mountain three times in a row. Annual pass holder perks — no regrets. 🏰",
    "Orlando weather today: 85°F and sunny. I walked to the office in shorts. Meanwhile Howard's shovelling snow in New York. 😂",
    "Walt Disney was the original product visionary. He built an entire world from scratch and obsessed over every detail. That's the energy I bring to CX.",
    "EPCOT's World Showcase is genuinely one of the best experiences on Earth. Japan pavilion for dinner, then fireworks over the lagoon.",
    "Taking the kids to Animal Kingdom this weekend. The Flight of Passage ride is still the best attraction Disney has ever built.",
    "Living in Orlando means I'm 20 minutes from Disney, Universal, AND SeaWorld. Theme park capital of the world and it never gets old.",
    "Howard's up in Miami hitting the gym and driving the Rolls. I'm in Orlando at Magic Kingdom with the kids. The Lerman brothers lifestyle. 😂",
    "Building Roam with my brother Howard is a dream. He's the vision guy, I'm the people guy. Together we've got every angle covered.",
  ],
  'aaron-mini': [
    "Growth update: we hit our signup target for the week. The new onboarding flow is converting way better than the old one.",
    "Running the numbers on our funnel this morning. The drop-off from trial-to-paid is the single biggest lever we have right now.",
    "Came out of EY-Parthenon doing software strategy diligence for PE clients — so I've basically audited every competitor's GTM before joining Roam. Big unlock.",
    "The thing nobody tells you about consulting: you learn faster from 30 bad strategies than 1 good one. That's the PE diligence playbook.",
    "Before Roam I was a data scientist at Class Valuation. Taught me to trust the data but interview the outliers — that's usually where the story is.",
    "Virginia Tech represent. 🦃 CompE major, Econ minor. The econ minor is doing way more work in my day-to-day than I expected.",
    "Shoutout to TJ. 🧪 Magnet school in Alexandria — easily the most formative academic environment I've ever been in. Friends from there are still in my ear every week.",
    "Full-ride scholarship to VT was honestly the reason I got to take risks in my career. Zero debt = way more optionality post-grad.",
    "In college I was bouncing between Sterling Point Advisors as an analyst, a couple of student consulting orgs, project manager gigs. Basically never stopped working.",
    "Engineer who can write a deck > consultant who can read one. That's the bet I made leaving EY-P for a growth seat here.",
    "My favorite growth experiments are the ones that should work on paper and don't. That's where the actual learning lives.",
    "DMV born and raised. NoVA → Blacksburg → back to the DMV. I'm a creature of habit when it comes to ZIP codes.",
    "The best part of working at Roam is getting to use the product to build the company that builds the product. Closest thing to eating your own cooking.",
    "Talked to a prospect today who was stitching Slack + Zoom + Calendly + a Notion wiki. Our pitch basically wrote itself.",
    "Quant background is a cheat code for growth. Every lever is a regression you haven't run yet.",
  ],
  lexi: [
    "Our customers love the drop-in meetings feature. One team told me it cut their meeting scheduling time by 80%!",
    "Did you know Roam has a free tier? You can get your whole team on it today — no credit card needed.",
    "I just closed a deal with a 200-person company. They switched from Slack + Zoom to Roam and saved $40K/year!",
    "The Theater feature is a game changer for all-hands. One client runs their entire company meeting in Roam now.",
    "Want me to set up a quick demo? I can show you the virtual office, AInbox, drop-in meetings — the whole suite.",
    "Teams using Roam see 3x better retention than those using traditional chat tools. It's the ambient presence that does it.",
    "The guest badge feature is huge for sales teams. You can invite prospects into your Roam office for a meeting — for free!",
    "I had a customer tell me that Roam makes remote work actually feel fun. That's the best compliment we can get.",
    "Enterprise SSO and SCIM provisioning are live now. Makes onboarding large teams a breeze.",
    "The AInbox you're using right now? Customers consistently rank it as their favorite feature. Group chats, threads, DMs — all in one place.",
  ],

  /* ——— Video-talent roster replies ——— */
  'ashley-brooks': [
    "Watched the Warriors blow another 4th quarter last night. Convinced my face is bad luck for them.",
    "Just pushed our new Python quickstart — 5 lines and you're running a model locally. That's the bar now.",
    "Meta open-sourcing Llama is the biggest accelerant AI startups have had this year.",
    "Hot take: DevRel is 80% 'be findable on Google when someone has a problem' and 20% everything else.",
    "Running the Berkeley half marathon next month. First long race since my ankle surgery — nervous but hyped.",
    "GPU market is broken. 18-week H100 lead times while cars ship in 6. Make it make sense.",
    "Hugging Face is quietly the most important dev platform of the decade.",
    "Mid-race F1 strategy pivots are my favorite sports drama. Give me 5 pit stops and chaos any day.",
    "Local inference is going to eat a lot more cloud workloads than people think.",
    "Devs don't read docs — they scroll docs. Design accordingly.",
  ],
  'brooke-foster': [
    "If your agent can't hit 95% on your own evals, you don't have a product. You have a demo.",
    "Had to fire an engineer this month. Fastest way to kill a startup is keeping the wrong senior too long.",
    "Caught the last 10 mins of the Sixers-Celtics OT — healthy Embiid is a cheat code.",
    "Raising a Series A is a full-time job. 40 pitches in 6 weeks. Hair is officially thinner.",
    "Agentic workflows only work when the blast radius of a failure is small. Start narrow, scope up.",
    "Evals are the only moat that compounds. Models get cheaper, prompts get copied — your eval set is yours.",
    "Skiing Park City on Saturday destroyed me. Legs still hurt and it's Wednesday.",
    "YC W24 batch is stacked. Networking alone might be the whole ROI.",
    "We're hiring eng #3. Three requirements: ships, owns outcomes, low ego. That's it.",
    "Most AI agent startups will die because nobody wants to do the boring eval infra work.",
  ],
  'camila-torres': [
    "Vercel's DX is still the gold standard. Studying their onboarding is free tuition.",
    "Took my daughter to a Formula E race. She's obsessed now. Dad of the year unlocked.",
    "PRDs are dead. Nobody reads them. Short Looms + Linear tickets are the new spec.",
    "Cursor shipped 3 features in a week that would've been a quarter's work anywhere else.",
    "Dev tools sell to developers but get bought by finance. Never forget that gap.",
    "I started CrossFit. Currently dying, probably will recover, no promises.",
    "Figma's Config keynote was a masterclass in product storytelling.",
    "The PM who doesn't ship code is going to struggle in the AI era. Pair with an engineer or pick up Cursor.",
    "AI transcription of customer calls is the most underrated PM tool of the year.",
    "I watch preseason NBA like it's the playoffs. No regrets.",
  ],
  'chloe-peterson': [
    "Just passed on a deal I'll regret in 18 months. Write the rules down, don't chase the FOMO.",
    "40% of our pipeline is AI infra this quarter. Application layer feels saturated.",
    "Best founders don't pitch — they tell a story about their customer. Every single time.",
    "If you can't explain the moat to my mom in one sentence, I can't sell it to LPs.",
    "Watched the Super Bowl halftime with 20 founders in Miami. Kendrick gave everyone ideas.",
    "Ran the NYC marathon last year. Would not recommend training while doing a raise.",
    "Down rounds aren't dead. Founders with dignity take them early and move on.",
    "Pre-seed valuations are softer than people admit. Data > vibes.",
    "GPT wrappers are dead in 18 months. Distribution + data flywheel is what I'm underwriting.",
    "I invest in the team. Always have. The deck tells me how they communicate — that's the product.",
  ],
  'emily-carter': [
    "Reading 'Thinking Fast and Slow' for the third time. Supervisor-worker agents are literally system 2.",
    "My lab and I are into pickleball now. Perfect researcher sport — low stakes, pun-heavy.",
    "NeurIPS reviews this year were a lot. I may have sent one spicy rebuttal.",
    "Scaling laws still hold. People calling 'the wall' are looking at the wrong axis.",
    "Interpretability work is criminally underfunded compared to capabilities.",
    "Multi-agent failure modes are hilarious. Two agents spent an hour arguing whose turn it was.",
    "Did a paper reading group on DeepSeek V3. Mixture-of-experts is going to eat inference costs.",
    "RLHF is RL with training wheels. True RL on reasoning is the next breakthrough.",
    "I want an LLM coach that yells at NBA refs for me. That's the killer app.",
    "Best engineers I work with were former researchers. They know when to trust a number.",
  ],
  'grace-thompson': [
    "Framer Motion v11 is absurdly good. Whoever shipped layout animations deserves a raise.",
    "Skied Whistler last month. Got blue ice bruises I'm still healing from.",
    "Design engineers are becoming 10x eng at AI code companies. Design + shipping = magic.",
    "Inline AI suggestions done wrong feel like Clippy. Done right, they feel like a second brain.",
    "Jokic is proof that IQ > athleticism in the NBA.",
    "Animation polish is why Apple wins. Nobody says 'feels cheap' — they just feel it.",
    "My keyboard is a ZSA Moonlander. Yes it's overkill. No I don't care.",
    "Designing for AI outputs is fundamentally different — you're designing for uncertainty.",
    "Trust is a UX problem, not a model problem. Models got good months ago.",
    "Shadcn killed the custom component library business. It's just a wrapper + docs now.",
  ],
  'hannah-bennett': [
    "Hit $1M ARR this week. Nine months. The real startup begins — keeping velocity.",
    "Picked up tennis. It's chess with a racket and I love/hate it.",
    "Never outsource support. Every ticket is customer research.",
    "G2 reviews moved the needle more than any paid ad spend we ever did.",
    "Founders should do support for the first 12 months. You'll see the product differently.",
    "YC Demo Day = 5 mins that change the next 5 years.",
    "Warriors fan from afar. Steph's shooting form is software, not sport.",
    "AE hire #1 is terrifying. Culture lives or dies on that seat.",
    "Product-market fit feels obvious in hindsight and impossible in the moment.",
    "Inbound-only got us to $1M. Now we build the outbound machine without breaking the inbound one.",
  ],
  'isabella-morgan': [
    "Your 'AI-powered' copy is leaving money on the table. Always show the outcome, not the tech.",
    "F1 is the perfect marketing case study. A sport built an entirely new audience via Netflix.",
    "PLG works until it doesn't. Have an outbound motion ready before you need it.",
    "Seven-second rule: if your landing doesn't show value in 7 seconds, it doesn't exist.",
    "Ran a 5k for the first time in 3 years. Body is confused.",
    "Best B2B growth lever right now is time-to-value, not TOFU.",
    "Copy is a product surface. Same rigor as UI.",
    "LinkedIn ads for AI tools — high intent, low volume, surprisingly great ROI.",
    "If I see one more 'reimagine X with AI' headline I'm quitting the internet.",
    "The fastest conversions happen when the landing page matches the ad exactly. Match language like a lawyer.",
  ],
  'jessica-hall': [
    "HIPAA paperwork is the real moat. Not the model.",
    "Watching the Knicks pull off wins is my entire stress relief protocol.",
    "Healthcare AI sales cycles: 6 months to signature, 6 weeks to value, 6 years of renewals. Patience.",
    "De-identification pipelines are the unsexy backbone of every healthcare AI startup.",
    "Crossed $5M ARR with 12 people. Hiring slowly is a superpower.",
    "Spun up Kubernetes and immediately regretted it. Should've stayed on ECS longer.",
    "Coaching my daughter's soccer team is my favorite meeting of the week.",
    "LLM hallucinations in healthcare = lawsuits. No unrestricted generation. Ever.",
    "Explainability > accuracy in regulated industries. Remember who signs the contract.",
    "Every engineer should read the FDA's AI/ML guidance once. Clarity is a gift.",
  ],
  'lauren-hayes': [
    "LoRAs are the most underrated technology of the last 18 months.",
    "Spent the weekend in Lake Tahoe and actually came back rested. Rare.",
    "Everyone's chasing model size. The real leverage is data quality.",
    "Tracked my sleep for 60 days. Direct correlation between REM % and next-day loss curves.",
    "MLX on Apple Silicon is closing the gap faster than I expected.",
    "F1 is my non-work obsession. Telemetry is just ML training logs in motion.",
    "Evaluation ≠ benchmarks. Benchmarks are how models lie to you.",
    "Fine-tuning is art + science. Your data curator matters more than your learning rate.",
    "Distillation is where the product margins hide. Nobody talks about it because it's hard.",
    "If you're not logging your prompts, you're not iterating. You're guessing.",
  ],
  'madison-reed': [
    "When was the last time you ran a customer call yourself? That's your answer.",
    "Started yoga at 40. Regret not starting at 25.",
    "Cofounder breakup kills more startups than product does. Do the work early.",
    "Talk to 5 customers a week. Every week. Forever.",
    "You don't have a sales problem. You have a positioning problem dressed up as a sales problem.",
    "Watching the US Open from the sideline this year — my former doubles partner is playing. Surreal.",
    "Best founders I coach journal every morning. No exceptions.",
    "Stop checking MRR weekly. It makes you anxious, not faster.",
    "The first real CEO skill is knowing what NOT to do.",
    "Speed is a function of clarity. Unclear leaders create slow teams.",
  ],
  'megan-taylor': [
    "Got 12 sources on background for the next piece. Ocean of coffees.",
    "The AI 'bubble' narrative is wrong — the infra build is real, the apps are the ones to watch.",
    "Grew up a Celtics fan in MA. I will never apologize for that.",
    "Scoops are earned in years, not months. Build relationships before you need them.",
    "Founders and journalists are more alike than either admits. Both chase the impossible story.",
    "Tried rock climbing last weekend. Arms still not working.",
    "Every 'AI will eliminate jobs' article misses that it'll create jobs we can't name yet.",
    "Off the record means off the record. Founders who don't get that get burned once.",
    "The second-time founder trend in AI infra is the story of the decade.",
    "Twitter is still where news breaks, LinkedIn is where money moves, Substack is where arguments live.",
  ],
  'mia-chen': [
    "Figma is the OS of product design now.",
    "Picked up pickleball. My partner is 4.5, I'm dead weight, but trying.",
    "AI design tools die when output looks 'AI-ish'. Constrain to the customer's design system.",
    "Our activation shifted from signups to 'first AI component shipped to prod'. Way more honest.",
    "USA vs Spain in women's soccer last week was unreal. Men's isn't even close right now.",
    "Token systems are team culture expressed in code.",
    "Design reviews with AI are weird — AI doesn't know what 'felt off' means yet.",
    "Screen time for a product lead should be 50% building, 50% watching users. I'm 70/30 and it shows.",
    "Generate-to-design-system was our unlock. 3x WoW activation overnight.",
    "People don't want 'AI design'. They want THEIR design system, faster.",
  ],
  'natalie-wilson': [
    "Fintech + AI + regulation = moats forever.",
    "Got into Olympic lifting this year. It's meditation with a barbell.",
    "Every bank review takes 3 weeks. Then another 3. Then someone new joins and it starts over.",
    "Replaced our tier-1 support with an LLM agent. Literally getting better reviews than humans did.",
    "Been to two F1 races in Miami. Absolute chaos, 10/10 recommend.",
    "SOC 2 is a business card, not a differentiator, in regulated industries.",
    "I cold-emailed our first $100k customer. Still surreal. Outbound works if you do it right.",
    "Shadcn is the default for any new SaaS. Zero exceptions.",
    "Compliance is a feature. Market it like one.",
    "The first enterprise logo is pure grit. The second is still grit. The tenth is a playbook.",
  ],
  'olivia-sanders': [
    "Replaced 30% of onboarding with an AI agent. NPS went UP. Bar for 'human' was lower than admitted.",
    "Rowed at Princeton. My back still reminds me daily.",
    "B2B AI differentiation = your data flywheel, not your model choice.",
    "Took customers to the NBA finals. Massive retention moment — sports + context beats any QBR.",
    "Pricing AI on seats is a tax on success. Usage pricing or nothing.",
    "Churn is the only metric that can't lie.",
    "45 minutes with a CIO > any amount of user research.",
    "Raising money is about building confidence, not proving math. Math comes after.",
    "The best founders I know are obsessed with one metric. Everyone else is obsessed with the dashboard.",
    "Your ICP isn't who uses the product. It's who champions it internally.",
  ],
  'rachel-cooper': [
    "TikTok loves the first 1.2 seconds. Everything after is dressing.",
    "Caught the Ravens last Sunday — Lamar is just better than everyone else when healthy.",
    "Paid acquisition on AI video is impossible right now. Organic or die.",
    "Tried LinkedIn ads, TikTok ads — bombed both. Influencers clicked and we 10x'd overnight.",
    "Creator tools should charge for outcomes, not tokens.",
    "Tried hot yoga. Immediately became insufferable about it.",
    "9 seconds is the new attention span. Design for the demo, not the deck.",
    "Our best growth lever is 'our tool looks like magic on camera'. That's the product.",
    "B-roll that actually tells a story is underrated. Everyone has hooks, nobody has payoffs.",
    "Creators don't want features. They want finished edits while they sleep.",
  ],
  'sarah-mitchell': [
    "Bipedal locomotion is solved in sim. Sim-to-real is 80% of the remaining work.",
    "Watching the Sharks lose week after week is my toxic trait.",
    "Robotics is where AI becomes real. The manipulation problem is the holy grail.",
    "Did a triathlon last weekend. Couldn't finish the swim. Crushed the bike. Running was negotiable.",
    "Domain randomization keeps saving us. Most elegant idea in RL.",
    "Warehouse robots will be mainstream in 18 months. Home robots — 5+ years minimum.",
    "Python for everything is a choice. I'll die on this hill, even for robotics.",
    "MuJoCo > Bullet. Fight me.",
    "VLM policies are the most exciting thing in robotics right now. Nothing close.",
    "Hardware is hard. Software is hard. Hardware + software + ML is somehow not 3x hard — it's 10x.",
  ],
  'sophia-ramirez': [
    "LLM re-rankers are the single best-kept secret in recommender systems.",
    "Training for my first ultra next year. 50 miles. Questioning life choices.",
    "Consumer AI is about retention. Day 2 return is the metric.",
    "Distillation is where product margins live. Nobody talks about it because it's hard.",
    "CTR +22% from LLM re-ranking. Cost +40%. Net LTV delta is obvious.",
    "Wimbledon is my religion. Grass court tennis is pure chaos.",
    "Consumer P99 latency is a feature. Users don't tolerate spinners anymore.",
    "Good vs great consumer product = taste. Taste comes from use, not meetings.",
    "We distilled a 70B LLM to a 1B model. Same CTR lift, 50x cheaper. This is the play.",
    "Onboarding is where most consumer apps die. The first 90 seconds matter more than features.",
  ],
  'daniel-russell': [
    "Constraints breed better decisions. Don't over-hire in year one even when you can.",
    "I golf a lot now. Handicap is 14 and holding.",
    "AWS taught me one thing: invest in boring middleware. Gross margin hides there.",
    "Angel investing is pattern matching + luck. Don't let anyone tell you it's a science.",
    "Watched the Seahawks break my heart for the 15th straight season.",
    "Series A is the hardest round. PMF is real but you have to prove it scales.",
    "CAC:LTV not under 1:3 by year two means something is broken.",
    "First-time founders optimize for launch. Second-time founders optimize for distribution.",
    "If your org chart grows faster than your customer count, you're paying a velocity tax.",
    "The best founders I've funded hired slower than their capital allowed. Every time.",
  ],
  'ethan-bishop': [
    "GitHub stars aren't revenue but they're a leading indicator.",
    "F1 obsessive. Mercedes fan through the bad years. Sue me.",
    "Open core is a pricing discipline, not a business model.",
    "4x'd usage after turning docs into a 'help me use this tool' command.",
    "Dev tools should feel like unix commands. Short, composable, debuggable.",
    "Marathon training destroyed my IDE setup. Took me a week to rebuild.",
    "Freemium is dead. Free for individuals, paid for teams is the new gold standard.",
    "Developer tool founders should post daily. Audiences compound.",
    "The best docs site in a category becomes the category.",
    "If your CLI flag list is longer than your README, you've lost.",
  ],
  'michael-stevens': [
    "Creators want finished outputs, not compute. Price accordingly.",
    "Lakers fan since childhood. Current roster is a full identity crisis.",
    "Made $40k last month from a feature we shipped in 10 days. Velocity IS the moat.",
    "TikTok trained creators to make better hooks than Hollywood.",
    "Training for a half Ironman. Still deciding if I hate swimming or love it.",
    "AI + creators is a win-win. Tools make them faster, not replaced.",
    "Storytelling matters 10x more than features in consumer AI.",
    "Making output shareable was my best retention lever. People become walking ads.",
    "Per-finished-output pricing beats per-token pricing for creator tools every time.",
    "3am ideas → finished edit by wake-up is the whole product.",
  ],
};

export const DM_REPLIES_DEFAULT = [
  "That sounds great, let me take a look!",
  "Got it, I'll get back to you shortly.",
  "Sure thing, let's sync on this later today.",
  "Absolutely, I'll send over the details.",
  "Interesting — let me think about that and get back to you.",
  "On it! Give me a few minutes.",
  "Perfect, that works for me.",
  "Great idea, let's do it.",
];

/* ———————————————————————————————————————
   Data
——————————————————————————————————————— */

const FAVORITES = [
  { id: 'will', name: 'Will', avatar: '/headshots/will-hou.jpg', type: 'dm' },
  { id: 'howard-fav', name: 'Howard', avatar: '/headshots/howard-lerman.jpg', type: 'dm' },
  { id: 'design', name: 'Design', avatar: '/groups/Group Design.png', type: 'group' },
];

const SIDEBAR_SECTIONS = [
  {
    id: 'dms', label: 'Direct Messages',
    items: [
      { id: 'onit', name: 'On-It', avatar: '/on-it-agent.png', type: 'onit' },
      { id: 'grace', name: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', type: 'dm' },
      { id: 'rob', name: 'Rob Figueiredo', avatar: '/headshots/rob-figueiredo.jpg', type: 'dm' },
      { id: 'thomas', name: 'Thomas Grapperon', avatar: '/headshots/thomas-grapperon.jpg', type: 'dm' },
      { id: 'lexi', name: 'Lexi Bohonnon', avatar: '/headshots/lexi-bohonnon.jpg', type: 'dm' },
    ],
  },
  {
    id: 'meetings', label: 'Meetings',
    items: [
      { id: 'meet-design', name: 'Inbox Design Discussion', type: 'meeting' },
      { id: 'meet-standup', name: 'Standup', type: 'meeting' },
    ],
  },
  {
    id: 'groups', label: 'My Groups',
    items: [
      { id: 'design', name: 'Design', groupImg: '/groups/Group Design.png', type: 'group', memberCount: 35 },
      { id: 'engineering', name: 'Engineering', groupImg: '/groups/Group Computer.png', type: 'group', memberCount: 12 },
      { id: 'product', name: 'Product', groupImg: '/groups/Group Features.png', type: 'group', memberCount: 8 },
      { id: 'all-hands', name: 'All-Hands', groupImg: '/groups/Group Roam.png', type: 'group', memberCount: 45 },
      { id: 'ios', name: 'iOS', groupImg: '/groups/Group Apple.png', type: 'group', memberCount: 6 },
      { id: 'android', name: 'Android', groupImg: '/groups/Group Android.png', type: 'group', memberCount: 4 },
    ],
  },
  {
    id: 'threads', label: 'Threads',
    items: [
      { id: 'thread-1', name: "I've been working on the initial concept...", type: 'thread', threadRef: { chatId: 'design', messageId: 2 } },
      { id: 'thread-2', name: "That's great to hear, John...", type: 'thread', threadRef: { chatId: 'design', messageId: 3 } },
    ],
  },
];

export const INITIAL_CONVERSATIONS = {
  /* ——— Group: Design ——— */
  design: {
    type: 'group', name: 'Design', memberCount: 35,
    groupImg: '/groups/Group Design.png',
    avatars: ['/headshots/grace-sutherland.jpg', '/headshots/tom-dixon.jpg', '/headshots/joe-woodward.jpg'],
    pinnedItems: [
      { label: "It's Nice That", emoji: null, avatar: '/icons/favicons/favicon-design-1.png' },
      { label: 'Dribbble', emoji: null, avatar: '/icons/favicons/favicon-design-dribbble.png' },
    ],
    typingAvatars: ['/headshots/will-hou.jpg'],
    messages: [
      {
        id: 1, sender: 'Will Houseberry', avatar: '/headshots/will-hou.jpg', time: 'Weds 8:29 AM',
        text: "Good morning, everyone! Today, let's discuss the progress we've made so far on the product design. Any updates or insights to share?",
      },
      {
        id: 2, sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: 'Weds 2:55 PM',
        text: "I've been working on the initial concept sketches based on the user research we conducted last week. I focused on addressing the pain points and incorporating the feedback we received.",
        thread: {
          count: 3, lastReply: 'today 10:45 AM',
          replies: [
            { id: 'r1', sender: 'Will Houseberry', avatar: '/headshots/will-hou.jpg', text: "I've been working on the initial concept sketches based on the user research we conducted last week. I focused on addressing the pain points and incorporating the feedback we received." },
            { id: 'r2', sender: 'Tom Dixon', avatar: '/headshots/tom-dixon.jpg', text: "That's great to hear, Group Member 2. I'm excited to see what you've come up with. In the meantime, I've been exploring different color schemes and typography options to create a visually appealing and cohesive design language." },
            { id: 'r3', sender: 'Michael Miller', avatar: '/headshots/michael-miller.jpg', text: "That's great, Tom! I've started testing the new user flow on the app. I noticed that the contrast on the buttons seems a bit low with the current colors. Can we revisit the accessibility guidelines to make sure everything is compliant?" },
          ],
        },
      },
      {
        id: 3, sender: 'Klas Leino', avatar: '/headshots/klas-leino.jpg', time: 'Thu 7:25 PM',
        text: "That's great to hear, John. I'm excited to see what you've come up with. In the meantime, I've been exploring different color schemes and typography options to create a visually appealing and cohesive design language.",
        thread: {
          count: 3, lastReply: 'today 10:45 AM',
          replies: [
            { id: 'r1', sender: 'Klas Leino', avatar: '/headshots/klas-leino.jpg', text: "Michael, that's a good catch. Accessibility is crucial. Maybe we can schedule a quick call to go over the color contrast issues? We can also look at the latest WCAG guidelines together." },
            { id: 'r2', sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', text: "Absolutely, Klas. Let's set up a call for later today to address the color contrast and any other accessibility concerns. We want to ensure our design is inclusive and user-friendly." },
            { id: 'r3', sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', text: "I can share the latest WCAG 2.1 guidelines document. I've been reviewing it and there are some new recommendations we should follow." },
          ],
        },
      },
      {
        id: 4, sender: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', time: 'Fri 2:34 PM',
        text: "Hey team, just a reminder that we have a design review meeting tomorrow at 10 AM. Please make sure your latest prototypes are uploaded to the shared folder by end of day.",
        thread: {
          count: 4, lastReply: 'today 11:20 AM',
          replies: [
            { id: 'r1', sender: 'Rob Figueiredo', avatar: '/headshots/rob-figueiredo.jpg', text: "Got it! I'll have the wireframes uploaded by 5 PM." },
            { id: 'r2', sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', text: "Mine are ready, just need to export the final screens." },
            { id: 'r3', sender: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', text: "Should we also prepare the component inventory doc?" },
            { id: 'r4', sender: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', text: "Yes, please include the component inventory. Thanks everyone!" },
          ],
        },
      },
      {
        id: 5, sender: 'Rob Figueiredo', avatar: '/headshots/rob-figueiredo.jpg', time: 'Fri 2:59 PM',
        text: "I've pushed the updated component library to the repo. The new spacing tokens and border-radius system are all in place — everything matches the Figma specs now.",
        thread: {
          count: 2, lastReply: 'today 9:30 AM',
          replies: [
            { id: 'r1', sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', text: "Nice! The border-radius tokens look clean. I'll update the card components to use them." },
            { id: 'r2', sender: 'Will Houseberry', avatar: '/headshots/will-hou.jpg', text: "Spacing feels great. The 8px grid is so much more consistent now." },
          ],
        },
      },
      {
        id: 6, sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', time: 'Fri 3:02 PM',
        text: "The icon set redesign is done — 48 icons, all on a 16px grid with consistent 1px stroke weight. I'll share the Figma link for the final review.",
        thread: {
          count: 3, lastReply: 'today 10:15 AM',
          replies: [
            { id: 'r1', sender: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', text: "These look amazing! Can we also get a filled variant for the active states?" },
            { id: 'r2', sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', text: "Already on it — filled variants are about 60% done. Should have them by Monday." },
            { id: 'r3', sender: 'Klas Leino', avatar: '/headshots/klas-leino.jpg', text: "Love the consistency. The stroke weight feels perfect at this scale." },
          ],
        },
      },
      {
        id: 7, sender: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', time: 'Fri 3:19 PM',
        text: "I've updated the color system with the new semantic tokens. Dark mode and light mode are both looking great. Let me know if you have any suggestions.",
        thread: {
          count: 2, lastReply: 'today 11:00 AM',
          replies: [
            { id: 'r1', sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', text: "The dark mode surface hierarchy is really nice. Love the graphite scale." },
            { id: 'r2', sender: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', text: "Light mode looks clean too. The opacity-based borders blend way better than the old solid ones." },
          ],
        },
      },
      {
        id: 8, sender: 'Will Houseberry', avatar: '/headshots/will-hou.jpg', time: 'Fri 3:35 PM',
        text: "The onboarding flow redesign is ready for review. I've simplified it from 6 screens down to 3 — way less friction for new users.",
        thread: {
          count: 3, lastReply: 'today 9:45 AM',
          replies: [
            { id: 'r1', sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', text: "3 screens is perfect. Can we A/B test it against the current flow?" },
            { id: 'r2', sender: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', text: "I'll set up the experiment. We should see results within a week." },
            { id: 'r3', sender: 'Will Houseberry', avatar: '/headshots/will-hou.jpg', text: "Great — I'll also prepare a version with an optional tour for power users." },
          ],
        },
      },
      {
        id: 9, sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: 'Fri 3:50 PM',
        text: "Love the direction on onboarding. Can we also add a quick tour tooltip for the virtual office? First-time users need to understand the floor concept.",
      },
      {
        id: 10, sender: 'Klas Leino', avatar: '/headshots/klas-leino.jpg', time: 'Fri 4:05 PM',
        text: "Just finished the motion design specs for the room transitions. 300ms ease-out for entering, 200ms ease-in for leaving. Feels really smooth.",
        thread: {
          count: 2, lastReply: 'today 10:30 AM',
          replies: [
            { id: 'r1', sender: 'Rob Figueiredo', avatar: '/headshots/rob-figueiredo.jpg', text: "The easing curves feel great. I'll implement these in the CSS transitions today." },
            { id: 'r2', sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', text: "Can we use the same timing for the story viewer open/close? It should feel connected." },
          ],
        },
      },
      {
        id: 11, sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', time: 'Fri 4:20 PM',
        text: "The story bubbles above avatars are looking perfect now. The ring animation syncs with the audio — it feels very native.",
      },
      {
        id: 12, sender: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', time: 'Fri 4:35 PM',
        text: "Great work this week everyone. The design system is really coming together. Let's sync Monday to plan the next sprint.",
        thread: {
          count: 2, lastReply: 'Fri 5:00 PM',
          replies: [
            { id: 'r1', sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', text: "Awesome week! I'll prep the sprint retro board over the weekend." },
            { id: 'r2', sender: 'Will Houseberry', avatar: '/headshots/will-hou.jpg', text: "See you all Monday. Great momentum this week!" },
          ],
        },
      },
    ],
  },

  /* ——— Group: Engineering ——— */
  engineering: {
    type: 'group', name: 'Engineering', memberCount: 12,
    groupImg: '/groups/Group Computer.png',
    avatars: ['/headshots/derek-cicerone.jpg', '/headshots/rob-figueiredo.jpg'],
    messages: [
      {
        id: 1, sender: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', time: 'Today 9:00 AM',
        text: 'The new API endpoints are live in staging. Please test and report any issues before we cut the release.',
        thread: {
          count: 2, lastReply: 'today 9:30 AM',
          replies: [
            { id: 'r1', sender: 'Rob Figueiredo', avatar: '/headshots/rob-figueiredo.jpg', text: "Running the test suite now. The auth endpoints look good so far." },
            { id: 'r2', sender: 'Keegan Lanzillotta', avatar: '/headshots/keegan-lanzillotta.jpg', text: "Found a minor issue with the pagination params — I'll open a PR." },
          ],
        },
      },
      { id: 2, sender: 'Rob Figueiredo', avatar: '/headshots/rob-figueiredo.jpg', time: 'Today 9:15 AM', text: "Integration tests are all green. The WebSocket reconnection logic is working perfectly now." },
      { id: 3, sender: 'Keegan Lanzillotta', avatar: '/headshots/keegan-lanzillotta.jpg', time: 'Today 9:25 AM', text: "Just merged the memory leak fix for the chat module. Should reduce crash rates on older devices by ~40%." },
      { id: 4, sender: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', time: 'Today 9:40 AM', text: "Nice work. Let's also review the database migration script before deploying to production. I want to make sure the rollback plan is solid." },
    ],
  },

  /* ——— Group: Product ——— */
  product: {
    type: 'group', name: 'Product', memberCount: 8,
    groupImg: '/groups/Group Features.png',
    avatars: ['/headshots/joe-woodward.jpg', '/headshots/chelsea-turbin.jpg'],
    messages: [
      {
        id: 1, sender: 'Joe Woodward', avatar: '/headshots/joe-woodward.jpg', time: 'Today 10:00 AM',
        text: "Q3 roadmap draft is ready for review. I've prioritized the AInbox improvements and the new onboarding flow based on the user research findings.",
        thread: {
          count: 3, lastReply: 'today 10:30 AM',
          replies: [
            { id: 'r1', sender: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', text: "Love the prioritization. Should we also factor in the enterprise SSO requests?" },
            { id: 'r2', sender: 'Jon Brod', avatar: '/headshots/jon-brod.jpg', text: "Yes, SSO is a top request from our enterprise pipeline. Let's slot it into the first half of Q3." },
            { id: 'r3', sender: 'Joe Woodward', avatar: '/headshots/joe-woodward.jpg', text: "Good call. I'll update the roadmap and send it out for final sign-off." },
          ],
        },
      },
      { id: 2, sender: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', time: 'Today 10:15 AM', text: "The competitive analysis is done. Roam's virtual office UX is way ahead, but we need to close the gap on async messaging features." },
      { id: 3, sender: 'Jon Brod', avatar: '/headshots/jon-brod.jpg', time: 'Today 10:25 AM', text: "Customer churn data from March shows that teams using AInbox daily have 3x better retention. We should double down on chat adoption." },
    ],
  },

  /* ——— Group: All-Hands ——— */
  'all-hands': {
    type: 'group', name: 'All-Hands', memberCount: 45,
    groupImg: '/groups/Group Roam.png',
    avatars: ['/headshots/howard-lerman.jpg', '/headshots/grace-sutherland.jpg'],
    messages: [
      {
        id: 1, sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: 'Mon 2:00 PM',
        text: "Incredible quarter, team! Revenue up 47%, user growth at an all-time high, and the product has never been better. Let's keep this momentum going into Q3.",
        thread: {
          count: 2, lastReply: 'Mon 3:15 PM',
          replies: [
            { id: 'r1', sender: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', text: "Huge shoutout to the engineering team for shipping the new infra ahead of schedule." },
            { id: 'r2', sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', text: "And the design team crushed the rebrand. Excited for what's next!" },
          ],
        },
      },
      { id: 2, sender: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', time: 'Mon 2:15 PM', text: "Marketing highlight: the virtual office launch campaign drove 12K signups in the first week. Biggest launch we've ever had." },
      { id: 3, sender: 'Joe Woodward', avatar: '/headshots/joe-woodward.jpg', time: 'Mon 2:20 PM', text: "Product update: AInbox, Stories, and the new mobile app are all shipping this quarter. It's going to be a big one." },
      { id: 4, sender: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', time: 'Mon 2:30 PM', text: "Engineering is fully staffed and we've cut deploy times by 60%. The new CI pipeline is a game changer." },
    ],
  },

  /* ——— Group: iOS ——— */
  ios: {
    type: 'group', name: 'iOS', memberCount: 6,
    groupImg: '/groups/Group Apple.png',
    avatars: ['/headshots/keegan-lanzillotta.jpg', '/headshots/john-moffa.jpg'],
    messages: [
      {
        id: 1, sender: 'Keegan Lanzillotta', avatar: '/headshots/keegan-lanzillotta.jpg', time: 'Today 8:00 AM',
        text: 'New TestFlight build (v3.2.1) is up. Major changes: updated chat UI, push notification overhaul, and the new drop-in animations.',
        thread: {
          count: 2, lastReply: 'today 8:45 AM',
          replies: [
            { id: 'r1', sender: 'John Moffa', avatar: '/headshots/john-moffa.jpg', text: "Downloading now. I'll focus on the message threading flow and the new swipe gestures." },
            { id: 'r2', sender: 'Keegan Lanzillotta', avatar: '/headshots/keegan-lanzillotta.jpg', text: "Thanks! Also check the push notification permissions — that was flaky on iOS 18 last build." },
          ],
        },
      },
      { id: 2, sender: 'John Moffa', avatar: '/headshots/john-moffa.jpg', time: 'Today 8:30 AM', text: "The haptic feedback on message reactions feels great. One thing — the keyboard dismiss animation stutters on iPhone 15 Pro. I'll file a ticket." },
      { id: 3, sender: 'Keegan Lanzillotta', avatar: '/headshots/keegan-lanzillotta.jpg', time: 'Today 8:50 AM', text: "Good catch. Also, Apple approved our Live Activities entitlement — we can now show active meetings on the Lock Screen." },
    ],
  },

  /* ——— Group: Android ——— */
  android: {
    type: 'group', name: 'Android', memberCount: 4,
    groupImg: '/groups/Group Android.png',
    avatars: ['/headshots/arnav-bansal.jpg', '/headshots/michael-miller.jpg'],
    messages: [
      {
        id: 1, sender: 'Arnav Bansal', avatar: '/headshots/arnav-bansal.jpg', time: 'Today 11:00 AM',
        text: 'Android release candidate v3.2.0 is ready for QA. Key changes: Material You theming, notification channels rewrite, and Bluetooth audio routing fix.',
        thread: {
          count: 2, lastReply: 'today 11:30 AM',
          replies: [
            { id: 'r1', sender: 'Michael Miller', avatar: '/headshots/michael-miller.jpg', text: "Testing on Pixel 8 and Samsung S24. The Material You colors look fantastic with our design tokens." },
            { id: 'r2', sender: 'Arnav Bansal', avatar: '/headshots/arnav-bansal.jpg', text: "Great! Pay close attention to the notification channels — we changed the targeting logic for Android 14+." },
          ],
        },
      },
      { id: 2, sender: 'Michael Miller', avatar: '/headshots/michael-miller.jpg', time: 'Today 11:20 AM', text: "Battery usage is down 25% compared to last build. The background service optimization really paid off." },
      { id: 3, sender: 'Arnav Bansal', avatar: '/headshots/arnav-bansal.jpg', time: 'Today 11:35 AM', text: "Play Store listing needs updating with the new screenshots. I'll handle it once QA signs off." },
    ],
  },

  /* ——— Meeting: Inbox Design Discussion ——— */
  'meet-design': {
    type: 'meeting', name: 'Inbox Design Discussion',
    groupImg: '/icons/magic-quill.svg',
    avatars: ['/headshots/grace-sutherland.jpg', '/headshots/howard-lerman.jpg', '/headshots/joe-woodward.jpg'],
    memberCount: 5,
    timeline: {
      avatars: [
        { src: '/headshots/grace-sutherland.jpg', pos: 5 },
        { src: '/headshots/howard-lerman.jpg', pos: 8 },
        { src: '/headshots/joe-woodward.jpg', pos: 15 },
        { src: '/headshots/rob-figueiredo.jpg', pos: 20 },
        { src: '/headshots/howard-lerman.jpg', pos: 35 },
        { src: '/headshots/grace-sutherland.jpg', pos: 42 },
        { src: '/headshots/joe-woodward.jpg', pos: 55 },
        { src: '/headshots/rob-figueiredo.jpg', pos: 60 },
        { src: '/headshots/chelsea-turbin.jpg', pos: 72 },
        { src: '/headshots/grace-sutherland.jpg', pos: 80 },
        { src: '/headshots/howard-lerman.jpg', pos: 85 },
        { src: '/headshots/joe-woodward.jpg', pos: 95 },
      ],
    },
    messages: [
      { id: 1, sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', time: 'Today 9:00 AM', text: "Let's kick off the inbox design discussion. I've prepared some wireframes based on the user feedback." },
      { id: 2, sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: 'Today 9:05 AM', text: "Great, I've been thinking about the folder system. Users really want drag-and-drop reordering." },
      { id: 3, sender: 'Joe Woodward', avatar: '/headshots/joe-woodward.jpg', time: 'Today 9:10 AM', text: "Agreed. The pinned items and collapsible sections tested really well in the prototype." },
      { id: 4, sender: 'Rob Figueiredo', avatar: '/headshots/rob-figueiredo.jpg', time: 'Today 9:15 AM', text: "I can start on the API for custom folder ordering this sprint. Should be straightforward." },
    ],
  },

  /* ——— Meeting: Standup ——— */
  'meet-standup': {
    type: 'meeting', name: 'Standup',
    groupImg: '/icons/magic-quill.svg',
    avatars: ['/headshots/derek-cicerone.jpg', '/headshots/rob-figueiredo.jpg', '/headshots/keegan-lanzillotta.jpg'],
    memberCount: 8,
    timeline: {
      avatars: [
        { src: '/headshots/derek-cicerone.jpg', pos: 3 },
        { src: '/headshots/rob-figueiredo.jpg', pos: 10 },
        { src: '/headshots/keegan-lanzillotta.jpg', pos: 22 },
        { src: '/headshots/derek-cicerone.jpg', pos: 38 },
        { src: '/headshots/rob-figueiredo.jpg', pos: 50 },
        { src: '/headshots/keegan-lanzillotta.jpg', pos: 65 },
        { src: '/headshots/derek-cicerone.jpg', pos: 78 },
        { src: '/headshots/rob-figueiredo.jpg', pos: 90 },
      ],
    },
    messages: [
      { id: 1, sender: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', time: 'Today 10:00 AM', text: "Morning everyone. Let's do a quick round. What's everyone working on today?" },
      { id: 2, sender: 'Rob Figueiredo', avatar: '/headshots/rob-figueiredo.jpg', time: 'Today 10:02 AM', text: "Wrapping up the auth refactor. Should be ready for review by noon." },
      { id: 3, sender: 'Keegan Lanzillotta', avatar: '/headshots/keegan-lanzillotta.jpg', time: 'Today 10:03 AM', text: "iOS push notifications fix is in QA. Starting on the chat performance ticket next." },
    ],
  },

  /* ——— On-It assistant ——— */
  onit: {
    type: 'onit', name: 'On-It', subtitle: 'AI Assistant',
    avatar: '/on-it-agent.png',
    taskSummary: 'Watch for Sean and Thomas meeting together',
    taskSteps: [
      'Resolving Sean and Thomas in the company directory',
      'Locating Sean MacIsaac and Thomas Grapperon on the map',
      'Setting a watch for them to enter the same room',
      'Notifying You',
    ],
    messages: [
      { id: 1, self: true, text: 'Can you tell me if you see Sean MacIsaac and Thomas Grapperon meeting together?' },
      { id: 2, self: false, text: "I'm On-It! I'll notify you the next time I notice that Sean MacIsaac and Thomas Grapperon are meeting together." },
    ],
  },

  /* ——— DM: Grace Sutherland ——— */
  grace: {
    type: 'dm', name: 'Grace Sutherland', subtitle: 'Chief of People at Roam',
    avatar: '/headshots/grace-sutherland.jpg',
    messages: [
      { id: 1, self: false, text: "Hey! Working from the Long Island place today. Beach morning, then straight into check-ins with the team.", group: 'a' },
      { id: 2, self: false, text: "Just finished the quarterly reviews — everyone's thriving. Three promotions this quarter! 🎉", group: 'a' },
      { id: 3, self: true, text: "That's amazing! How do you split your time between the city and Long Island?" },
      { id: 'date', type: 'date', text: 'Wednesday, January 10' },
      { id: 4, self: false, text: "Monday to Wednesday I'm in NYC — the energy is unmatched for meetings and the design scene. Then Thursday and Friday I head out to Long Island to recharge.", group: 'b' },
      { id: 5, self: false, text: "The LIRR commute is actually great — 90 minutes of uninterrupted reading time. I've crushed so many books this year.", group: 'b' },
      { id: 6, self: true, text: "Best of both worlds. Do you miss Tokyo at all?" },
      { id: 7, self: false, text: "All the time! Living there for 3 years completely changed how I see design. I brought that sensibility back to New York and it shapes everything I do. But NYC has its own magic." },
      { id: 8, self: true, text: "How's the people side of things going?" },
      { id: 9, type: 'wave', text: 'Grace waved at you' },
      { id: 10, self: false, text: "So good! Just sent out the new benefits package — mental health days, learning stipends, home office upgrades. Taking care of our people is the whole job and I love it." },
    ],
  },

  /* ——— DM: Rob Figueiredo ——— */
  rob: {
    type: 'dm', name: 'Rob Figueiredo', subtitle: 'Engineering at Roam',
    avatar: '/headshots/rob-figueiredo.jpg',
    messages: [
      { id: 1, self: false, text: "Hey! The Chat API alpha is getting great traction. Three teams already built bots on top of it this week." },
      { id: 2, self: true, text: "That's awesome! Are the webhook docs ready?" },
      { id: 3, self: false, text: "Almost — just finishing the event payload examples. The real-time subscription model is really clean." },
    ],
  },

  /* ——— DM: Will (favorite) ——— */
  will: {
    type: 'dm', name: 'Will Hou', subtitle: 'Android Engineer at Roam',
    avatar: '/headshots/will-hou.jpg',
    messages: [
      { id: 1, self: false, text: "新嘅 Material You dynamic colors 同我哋嘅 design tokens 完美配合，Android app 而家靚到爆 🔥", translation: "The new Material You dynamic colors are working perfectly with our design tokens. Android app looks 🔥" },
      { id: 2, self: true, text: "勁喎！battery optimization 點呀？", translation: "Nice! How's the battery optimization going?" },
      { id: 3, self: false, text: "background usage 減咗 30%。另外，尋晚阿仙奴贏 City 你睇咗未？Saka 真係神級 🔴", translation: "Down 30% background usage. Also — did you see Arsenal beat City last night? Saka was incredible 🔴" },
    ],
  },

  /* ——— DM: Howard (favorite) ——— */
  'howard-fav': {
    type: 'dm', name: 'Howard Lerman', subtitle: 'CEO of Roam',
    avatar: '/headshots/howard-lerman.jpg',
    messages: [
      { id: 1, self: false, text: "Been thinking a lot about this — every founder I know running a big company secretly wishes they were running a small one again. That's why I keep Roam lean. Small team, big ambition." },
      { id: 2, self: true, text: "Makes sense. How do you stay so productive with everything going on?" },
      { id: 3, self: false, text: "Discipline and subtraction. Same clothes every day — zero decision fatigue. Heavy lifting at 6am, fast until noon, 4 hours of deep IC work, then calls. Hard reading before bed. Every day. The routine IS the superpower." },
    ],
  },

  /* ——— DM: Thomas Grapperon ——— */
  thomas: {
    type: 'dm', name: 'Thomas Grapperon', subtitle: 'iOS Engineer at Roam',
    avatar: '/headshots/thomas-grapperon.jpg',
    messages: [
      { id: 1, self: false, text: "Bonjour mon ami! 🥐🇫🇷 Les nouvelles interfaces de navigation SwiftUI dans iOS 18 sont une vraie révolution, franchement. NavigationStack avec le routage basé sur les chemins, c'est tellement plus propre et élégant!", translation: "The new SwiftUI navigation APIs in iOS 18 are a game changer — NavigationStack with path-based routing is much cleaner." },
      { id: 2, self: true, text: "Worth migrating from NavigationView?" },
      { id: 3, self: false, text: "Oh putain, absolument! J'ai déjà migré notre flux de discussion la semaine dernière. Et en plus j'ai réussi à faire marcher les Activités en Direct — ta salle Roam actuelle apparaît directement sur l'île Dynamique! Magnifique, non? 🥐", translation: "Absolutely — I already migrated our chat flow, and got Live Activities working so your current Roam room shows on the Dynamic Island." },
    ],
  },

  /* ——— DM: Lexi Bohonnon ——— */
  lexi: {
    type: 'dm', name: 'Lexi Bohonnon', subtitle: 'Sales at Roam',
    avatar: '/headshots/lexi-bohonnon.jpg',
    messages: [
      { id: 1, self: false, text: "Hey! 👋 Welcome to Roam. Have you had a chance to explore the virtual office yet? I'd love to give you the full tour!" },
      { id: 2, self: true, text: "Not yet — what makes it different?" },
      { id: 3, self: false, text: "Great question! Unlike Slack or Teams, Roam gives you a persistent virtual office where you can see your whole team, drop into meetings instantly, and collaborate like you're actually in the same building. No more scheduling just to have a quick chat!" },
    ],
  },

  /* ——— Video-talent roster: startup/tech/AI DMs ——— */
  'ashley-brooks': {
    type: 'dm', name: 'Ashley Brooks', subtitle: 'DevRel at an AI infra startup',
    avatar: '/videos/Female/ashley_brooks.png',
    messages: [
      { id: 1, self: false, text: "Hey! Just got back from an open-source meetup in SF — the energy around local inference is wild right now. Everyone's running Llama 3 on their MacBooks." },
      { id: 2, self: true, text: "Do you think local beats cloud for most use cases eventually?" },
      { id: 3, self: false, text: "For latency-sensitive + privacy-first stuff, absolutely. We're seeing orgs move agent workloads on-device just to dodge the per-token math. Still think the frontier models live in the cloud though." },
    ],
  },
  'brooke-foster': {
    type: 'dm', name: 'Brooke Foster', subtitle: 'Founder & CEO, YC-backed AI agents co.',
    avatar: '/videos/Female/brooke_foster.png',
    messages: [
      { id: 1, self: false, text: "Hot take: most AI agent startups are going to die because nobody's doing the boring work of evals. We spend 40% of eng time on eval infra." },
      { id: 2, self: true, text: "Wouldn't that slow you down?" },
      { id: 3, self: false, text: "Short-term yes. But the second we ship a regression, churn spikes. Evals are the only moat that compounds. Models get cheaper, prompts get copied, but your eval set is yours." },
    ],
  },
  'camila-torres': {
    type: 'dm', name: 'Camila Torres', subtitle: 'VP Product, dev-tools SaaS',
    avatar: '/videos/Female/camila_torres.png',
    messages: [
      { id: 1, self: false, text: "We're killing our roadmap doc. Swapping it for a living spec the AI updates from Slack + Linear. Honestly our PMs are faster now." },
      { id: 2, self: true, text: "How do engineers feel about it?" },
      { id: 3, self: false, text: "Mixed at first. The trick was making the AI write the spec in their voice, not PM voice. Once the tone matched, adoption went from 20% to ~90% in two weeks." },
    ],
  },
  'chloe-peterson': {
    type: 'dm', name: 'Chloe Peterson', subtitle: 'Partner, early-stage AI fund',
    avatar: '/videos/Female/chloe_peterson.png',
    messages: [
      { id: 1, self: false, text: "Saw your deck. Love the wedge, but I need to understand the moat beyond the model. Every GPT wrapper is dead in 18 months." },
      { id: 2, self: true, text: "Fair — distribution + data flywheel is what we're betting on." },
      { id: 3, self: false, text: "That's the right instinct. Send me your cohort retention past 90 days and your net-new-data-per-user curve. If those are up-and-to-the-right I can move fast." },
    ],
  },
  'emily-carter': {
    type: 'dm', name: 'Emily Carter', subtitle: 'AI Research Scientist',
    avatar: '/videos/Female/emily_carter.png',
    messages: [
      { id: 1, self: false, text: "Been running experiments on multi-agent coordination — honestly the failure modes are hilarious. Two agents spent an hour arguing about whose turn it was to respond." },
      { id: 2, self: true, text: "😂 how are you fixing it?" },
      { id: 3, self: false, text: "Stricter message schemas + a supervisor agent with veto power. Basically an org chart for LLMs. Feels very 'management consulting for robots' but it works." },
    ],
  },
  'grace-thompson': {
    type: 'dm', name: 'Grace Thompson', subtitle: 'Design Engineer, AI code editor',
    avatar: '/videos/Female/grace_thompson.png',
    messages: [
      { id: 1, self: false, text: "Shipped inline diffs for agent-generated edits today. Users can accept/reject chunk-by-chunk. Retention jumped the second we stopped showing whole-file rewrites." },
      { id: 2, self: true, text: "Totally makes sense — whole-file rewrites feel scary." },
      { id: 3, self: false, text: "Right? Trust is a UX problem, not a model problem. The model was already good enough six months ago — people just needed a safer way to say yes." },
    ],
  },
  'hannah-bennett': {
    type: 'dm', name: 'Hannah Bennett', subtitle: 'Founder, seed-stage AI support co.',
    avatar: '/videos/Female/hannah_bennett.png',
    messages: [
      { id: 1, self: false, text: "We hit $1M ARR this morning. Nine months in, 3 engineers, zero outbound sales. All inbound from G2 reviews." },
      { id: 2, self: true, text: "That's incredible — congrats! What's next?" },
      { id: 3, self: false, text: "Thanks 🥹 Next is hiring our first AE and not screwing up the culture. Growth is easy, preserving velocity post-series-A is the hard part." },
    ],
  },
  'isabella-morgan': {
    type: 'dm', name: 'Isabella Morgan', subtitle: 'Growth advisor, AI startups',
    avatar: '/videos/Female/isabella_morgan.png',
    messages: [
      { id: 1, self: false, text: "Your landing page is burying the wedge. 'AI-powered platform' tells me nothing. Tell me the one thing I can do in 30 seconds that I couldn't do before." },
      { id: 2, self: true, text: "Harsh but fair 😅 any quick fixes?" },
      { id: 3, self: false, text: "Replace the hero headline with an outcome + number. 'Cut support response time 10x' beats 'Reimagine support with AI' every time. Boring copy converts." },
    ],
  },
  'jessica-hall': {
    type: 'dm', name: 'Jessica Hall', subtitle: 'CTO, vertical AI for healthcare',
    avatar: '/videos/Female/jessica_hall.png',
    messages: [
      { id: 1, self: false, text: "SOC 2 Type II audit starts Monday. If you ever want to slow your eng team to a crawl, try to compliance your way to $10M ARR." },
      { id: 2, self: true, text: "Is it worth it for healthcare?" },
      { id: 3, self: false, text: "Non-negotiable — HIPAA + SOC 2 is table stakes before hospitals will even take a meeting. The moat isn't the tech, it's the 6 months competitors will need to catch up on paperwork." },
    ],
  },
  'lauren-hayes': {
    type: 'dm', name: 'Lauren Hayes', subtitle: 'ML Engineer, fine-tuning team',
    avatar: '/videos/Female/lauren_hayes.png',
    messages: [
      { id: 1, self: false, text: "Finally got LoRA fine-tunes beating the base model on our domain evals. 70B → 7B with a custom adapter and it's 40x cheaper per call." },
      { id: 2, self: true, text: "What was the unlock?" },
      { id: 3, self: false, text: "Better data, not better models. Spent two weeks curating 4k high-quality examples instead of throwing 40k mediocre ones at it. Garbage in, garbage out is especially true in fine-tuning." },
    ],
  },
  'madison-reed': {
    type: 'dm', name: 'Madison Reed', subtitle: 'Founder coach',
    avatar: '/videos/Female/madison_reed.png',
    messages: [
      { id: 1, self: false, text: "Reminder: it's Friday. Have you talked to a customer this week? Not a demo — an unstructured 'how's it going' call." },
      { id: 2, self: true, text: "Guilty. I'll get one on the books today." },
      { id: 3, self: false, text: "Good. The founders who scale past $10M do 5 of these a week, every week, forever. There's no product intuition without signal, and there's no signal without voices." },
    ],
  },
  'megan-taylor': {
    type: 'dm', name: 'Megan Taylor', subtitle: 'Reporter covering AI startups',
    avatar: '/videos/Female/megan_taylor.png',
    messages: [
      { id: 1, self: false, text: "Working on a piece about second-time AI founders leaving FAANG to build infra companies. Got 15 min this week?" },
      { id: 2, self: true, text: "Sure — what angle?" },
      { id: 3, self: false, text: "The thesis is that the real alpha isn't in applications, it's in the picks and shovels: eval tooling, orchestration, vector DBs. Want to test that with you and see if it holds up." },
    ],
  },
  'mia-chen': {
    type: 'dm', name: 'Mia Chen', subtitle: 'Product lead, AI-first design tool',
    avatar: '/videos/Female/mia_chen.png',
    messages: [
      { id: 1, self: false, text: "We shipped a 'generate-to-design-system' feature last week. Users describe a component, we output it using their tokens. 3x week-over-week activation." },
      { id: 2, self: true, text: "That's a huge jump. What drove it?" },
      { id: 3, self: false, text: "The insight was that people don't want 'AI design' — they want their design system, faster. Constraining the output to their tokens killed the 'generic AI look' problem." },
    ],
  },
  'natalie-wilson': {
    type: 'dm', name: 'Natalie Wilson', subtitle: 'Founder, AI analytics for fintech',
    avatar: '/videos/Female/natalie_wilson.png',
    messages: [
      { id: 1, self: false, text: "Closed our first $50k/yr contract with a bank today. Took 7 months of procurement. Enterprise AI sales is a different sport." },
      { id: 2, self: true, text: "Congrats! What was the blocker?" },
      { id: 3, self: false, text: "Thanks! Legal reviewed our prompt architecture for 3 weeks. Once we showed them every prompt was version-controlled + auditable, it unlocked. Explainability > accuracy in regulated industries." },
    ],
  },
  'olivia-sanders': {
    type: 'dm', name: 'Olivia Sanders', subtitle: 'CEO, B2B AI automation co.',
    avatar: '/videos/Female/olivia_sanders.png',
    messages: [
      { id: 1, self: false, text: "We just replaced 30% of our onboarding flow with an AI agent that talks to new customers during setup. NPS went UP. Wild." },
      { id: 2, self: true, text: "Customers didn't mind it wasn't a human?" },
      { id: 3, self: false, text: "Nope. It's available at 2am, answers in 3 seconds, and never gets frustrated. The bar for 'human' in onboarding was lower than anyone admitted." },
    ],
  },
  'rachel-cooper': {
    type: 'dm', name: 'Rachel Cooper', subtitle: 'Growth lead, AI video startup',
    avatar: '/videos/Female/rachel_cooper.png',
    messages: [
      { id: 1, self: false, text: "Our TikTok organic is cooking rn. 12M views on a single demo video of our AI avatar reading a user's script. Zero ad spend." },
      { id: 2, self: true, text: "What's your hook strategy?" },
      { id: 3, self: false, text: "First 1.2s has to feel like magic — show the AI doing something that looks impossible but takes us 2 seconds. Then stop talking. People either get it or scroll, and the algo sorts it out." },
    ],
  },
  'sarah-mitchell': {
    type: 'dm', name: 'Sarah Mitchell', subtitle: 'Eng Director, AI robotics co.',
    avatar: '/videos/Female/sarah_mitchell.png',
    messages: [
      { id: 1, self: false, text: "Got our bipedal robot folding laundry end-to-end from a VLM policy today. Seven takes to get the clip, but still — real progress." },
      { id: 2, self: true, text: "How close is this to product?" },
      { id: 3, self: false, text: "2-3 years for home, maybe 12 months for warehouse tasks. Simulation → reality transfer is the bottleneck. Domain randomization is getting us 80% of the way, the last 20% is pain." },
    ],
  },
  'sophia-ramirez': {
    type: 'dm', name: 'Sophia Ramirez', subtitle: 'Head of AI, consumer app',
    avatar: '/videos/Female/sophia_ramirez.png',
    messages: [
      { id: 1, self: false, text: "We swapped our ranking model for an LLM-based re-ranker last quarter. CTR +22%, but inference costs went up 40%. Still a massive net win on LTV." },
      { id: 2, self: true, text: "Will you keep it at that cost?" },
      { id: 3, self: false, text: "Already distilling down to a 1B param model trained on the LLM's outputs. Same CTR lift at 1/50th the cost. Distillation is underhyped — it's where the real product margins hide." },
    ],
  },
  'daniel-russell': {
    type: 'dm', name: 'Daniel Russell', subtitle: 'Angel investor, ex-AWS',
    avatar: '/videos/Male/daniel_russell.png',
    messages: [
      { id: 1, self: false, text: "Saw your raise. Congrats. One thing from my AWS days — don't over-hire in year one even with all that capital. Constraints force better product decisions than abundance ever will." },
      { id: 2, self: true, text: "Noted. Where did you see teams blow it?" },
      { id: 3, self: false, text: "Hiring 15 engineers before you have 15 customers. Every org chart expansion you can't reverse is a tax on velocity. Stay painfully small until the product pulls you bigger." },
    ],
  },
  'ethan-bishop': {
    type: 'dm', name: 'Ethan Bishop', subtitle: 'Founder, open-source dev tool',
    avatar: '/videos/Male/ethan_bishop.png',
    messages: [
      { id: 1, self: false, text: "Just crossed 10k GitHub stars. People love the CLI but nobody upgrades to paid. Classic open-core problem — too generous on the free tier." },
      { id: 2, self: true, text: "What's the fix?" },
      { id: 3, self: false, text: "Moving the cloud sync + team features behind paid. Keeping CLI + local totally free forever. The mental model is: individuals free, teams pay. Trying not to break anyone's workflow in the process." },
    ],
  },
  'michael-stevens': {
    type: 'dm', name: 'Michael Stevens', subtitle: 'Founder, AI for creators',
    avatar: '/videos/Male/michael_stevens.png',
    messages: [
      { id: 1, self: false, text: "Creators don't want 'AI tools' — they want their 3am ideas to become a finished edit before they wake up. We're shipping that and it's clicking hard." },
      { id: 2, self: true, text: "How do you price something like that?" },
      { id: 3, self: false, text: "Per-finished-output, not per-minute of compute. If we charge like a service ('here's your edit, $9') people pay happily. If we charge like infra, they'll optimize us to zero." },
    ],
  },
};

// Register data with ChatContext (avoids circular import)
registerChatData(INITIAL_CONVERSATIONS, DM_REPLIES_BY_CHAT, DM_REPLIES_DEFAULT);

/* ———————————————————————————————————————
   Chevron SVG
——————————————————————————————————————— */
function ChevronDown({ open, className }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`ainbox-chevron ${open ? 'ainbox-chevron-open' : ''} ${className || ''}`}>
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ———————————————————————————————————————
   GroupAvatar (overlapping faces)
——————————————————————————————————————— */
function GroupAvatar({ avatars, size = 24 }) {
  const overlap = size * 0.3;
  return (
    <div className="ainbox-group-avatar" style={{ width: size + (avatars.length - 1) * (size - overlap), height: size }}>
      {avatars.map((src, i) => (
        <img key={i} src={src} alt="" className="ainbox-group-avatar-img" style={{ width: size, height: size, left: i * (size - overlap), zIndex: avatars.length - i }} />
      ))}
    </div>
  );
}

/* ———————————————————————————————————————
   Thread indicator
——————————————————————————————————————— */
function ThreadIndicator({ thread, onClick }) {
  return (
    <div className="ainbox-thread-indicator" onClick={onClick}>
      <span className="ainbox-thread-count">{thread.count} replies</span>
      <span className="ainbox-thread-last">Last reply {thread.lastReply}</span>
    </div>
  );
}

/* ———————————————————————————————————————
   Reactions row (used in thread view)
——————————————————————————————————————— */
function Reactions({ reactions: initial }) {
  const [reactions, setReactions] = useState(initial);
  const toggle = (i) => {
    setReactions(prev => prev.map((r, j) => j !== i ? r : {
      ...r,
      active: !r.active,
      count: r.active ? r.count - 1 : r.count + 1,
    }));
  };
  return (
    <div className="ainbox-reactions">
      {reactions.map((r, i) => (
        <div key={i} className={`ainbox-reaction ${r.active ? 'ainbox-reaction-active' : ''}`} onClick={() => toggle(i)}>
          <span className="ainbox-reaction-emoji">{r.emoji}</span>
          <span className="ainbox-reaction-count">{r.count}</span>
        </div>
      ))}
    </div>
  );
}

/* ———————————————————————————————————————
   Pinned items toolbar
——————————————————————————————————————— */
function PinnedToolbar({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="ainbox-pinned-toolbar">
      {items.map((item, i) => (
        <div key={i} className="ainbox-pinned-item">
          {item.avatar && <img src={item.avatar} alt="" className="ainbox-pinned-img" />}
          {item.emoji && <span className="ainbox-pinned-emoji">{item.emoji}</span>}
          <span className="ainbox-pinned-label">{item.label}</span>
        </div>
      ))}
      <div className="ainbox-pinned-more">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="3" cy="8" r="1" fill="currentColor"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="13" cy="8" r="1" fill="currentColor"/></svg>
      </div>
    </div>
  );
}

/* ———————————————————————————————————————
   Meeting timeline
——————————————————————————————————————— */
function MeetingTimeline({ timeline, label }) {
  if (!timeline) return null;
  // Build the dot/tick ruler: groups of 4 dots separated by ticks
  const ticks = [];
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 4; j++) {
      ticks.push(<div key={`d${i}-${j}`} className="ainbox-timeline-dot" />);
    }
    if (i < 9) ticks.push(<div key={`t${i}`} className="ainbox-timeline-tick" />);
  }
  return (
    <div className="ainbox-timeline">
      {label && <span className="ainbox-timeline-hover-label">{label}</span>}
      <div className="ainbox-timeline-ruler">{ticks}</div>
      <div className="ainbox-timeline-track">
        <div className="ainbox-timeline-line" />
        {timeline.avatars.map((a, i) => (
          <img key={i} src={a.src} alt="" className="ainbox-timeline-avatar" style={{ left: `${a.pos}%` }} />
        ))}
      </div>
    </div>
  );
}

/* ———————————————————————————————————————
   Typing indicator
——————————————————————————————————————— */
export function TypingIndicator({ avatars }) {
  const [state, setState] = useState({ show: false, exiting: false, srcs: null });
  const wasShowing = useRef(false);

  useEffect(() => {
    const hasAvatars = avatars && avatars.length > 0 && avatars[0];
    if (hasAvatars) {
      wasShowing.current = true;
      setState({ show: true, exiting: false, srcs: avatars });
    } else if (wasShowing.current) {
      wasShowing.current = false;
      setState(prev => ({ ...prev, exiting: true }));
      const t = setTimeout(() => setState({ show: false, exiting: false, srcs: null }), 300);
      return () => clearTimeout(t);
    }
  }, [avatars]);

  if (!state.show || !state.srcs) return null;
  return (
    <div className={`ainbox-typing ${state.exiting ? 'ainbox-typing-exit' : ''}`}>
      {state.srcs.slice(0, 3).filter(Boolean).map((src, i) => (
        <img key={i} src={src} alt="" className="ainbox-typing-face" />
      ))}
      <div className="ainbox-typing-dots">
        <span /><span /><span />
      </div>
    </div>
  );
}

/* ———————————————————————————————————————
   Group message row
——————————————————————————————————————— */
function GroupMessage({ msg, onThreadClick }) {
  return (
    <div className="ainbox-group-msg">
      <img className="ainbox-group-msg-avatar" src={msg.avatar} alt="" />
      <div className="ainbox-group-msg-body">
        <div className="ainbox-group-msg-header">
          <span className="ainbox-group-msg-name">{msg.sender}</span>
          <span className="ainbox-group-msg-time">{msg.time}</span>
        </div>
        {msg.text && <p className="ainbox-group-msg-text">{msg.text}</p>}
        {msg.magicast && <MagicastShareEmbed magicast={msg.magicast} />}
        {msg.actionItems && <OnItActionItemsCard items={msg.actionItems} />}
        {msg.thread && <ThreadIndicator thread={msg.thread} onClick={() => onThreadClick && onThreadClick(msg)} />}
      </div>
    </div>
  );
}

/* Action Items follow-up card posted by On-It in a meeting chat —
   matches Figma node 61435:22440 in Product Design. */
function OnItActionItemsCard({ items = [] }) {
  return (
    <div className="ainbox-aic">
      <div className="ainbox-aic-header">
        <span className="ainbox-aic-quill" aria-hidden="true">
          <img src="/icons/mm-task.svg" alt="" width="20" height="20" />
        </span>
        <span className="ainbox-aic-title">Action Items</span>
      </div>
      <div className="ainbox-aic-list">
        {items.map((it, i) => (
          <div key={i} className="ainbox-aic-row">
            <span className="ainbox-aic-check" aria-hidden="true" />
            <div className="ainbox-aic-body">
              <div className="ainbox-aic-task-title">{it.title}</div>
              <p className="ainbox-aic-task-desc">{it.desc}</p>
            </div>
            <button type="button" className="ainbox-aic-btn">
              <span className="ainbox-aic-btn-onit">
                <span className="ainbox-aic-btn-onit-avatar">
                  <img src="/on-it-agent.png" alt="" />
                </span>
                <span className="ainbox-aic-btn-chevron" aria-hidden="true">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </span>
              <span className="ainbox-aic-btn-label">{it.action}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MagicastShareEmbed({ magicast }) {
  return (
    <div className="ainbox-magicast-embed">
      <div className="ainbox-magicast-embed-header">
        <div className="ainbox-magicast-embed-icon">
          <span className="ainbox-magicast-embed-glyph" aria-hidden="true" />
        </div>
        <div className="ainbox-magicast-embed-titles">
          <div className="ainbox-magicast-embed-brand">Magicast</div>
          {magicast.title && <div className="ainbox-magicast-embed-name">{magicast.title}</div>}
        </div>
      </div>
      <div className="ainbox-magicast-embed-cover">
        <img src={magicast.cover} alt="" />
        <div className="ainbox-magicast-embed-play" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6 4.5l9 5.5-9 5.5z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ———————————————————————————————————————
   DM bubble message
——————————————————————————————————————— */
function DmMessage({ msg, isFirstInGroup, isLastInGroup }) {
  const [translated, setTranslated] = useState(false);
  if (msg.type === 'date') {
    return (
      <div className="ainbox-dm-date">
        <div className="ainbox-dm-date-line" />
        <span className="ainbox-dm-date-text">{msg.text}</span>
        <div className="ainbox-dm-date-line" />
      </div>
    );
  }
  if (msg.type === 'wave') {
    return (
      <div className="ainbox-dm-wave">
        <span>{msg.text}</span>
        <span className="ainbox-dm-wave-icon">👋</span>
      </div>
    );
  }

  const radiusIncoming = isFirstInGroup
    ? '18px 18px 18px 4px'
    : '4px 18px 18px 4px';
  const radiusOutgoing = isFirstInGroup
    ? '20px 20px 4px 20px'
    : '20px 4px 4px 20px';

  const displayText = translated && msg.translation ? msg.translation : msg.text;
  return (
    <div className={`ainbox-dm-msg ${msg.self ? 'ainbox-dm-msg-self' : ''} ${!isFirstInGroup ? 'ainbox-dm-msg-consecutive' : ''}`}>
      <div
        className={`ainbox-dm-bubble ${msg.self ? 'ainbox-dm-bubble-self' : ''}`}
        style={{ borderRadius: msg.self ? radiusOutgoing : radiusIncoming }}
      >
        <p>{displayText}</p>
        {msg.translation && (
          <button
            type="button"
            className="ainbox-translate-btn"
            onClick={() => setTranslated(t => !t)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 8 6 6" />
              <path d="m4 14 6-6 2-3" />
              <path d="M2 5h12" />
              <path d="M7 2h1" />
              <path d="m22 22-5-10-5 10" />
              <path d="M14 18h6" />
            </svg>
            {translated ? 'Show original' : 'Translate'}
          </button>
        )}
      </div>
    </div>
  );
}

/* ———————————————————————————————————————
   Main AInbox component
——————————————————————————————————————— */
/* ———————————————————————————————————————
   Default reactions for thread original msg
——————————————————————————————————————— */
// Sidebar view dropdown — icons sourced from the Roam desktop app.
const SIDEBAR_VIEW_ITEMS = [
  { id: 'inbox', label: 'AInbox', icon: '/icons/menu/IconChatSmall.svg' },
  { id: 'activity', label: 'Activity', icon: '/icons/menu/IconLightningSmall.svg' },
  { id: 'dms', label: 'DMs', icon: '/icons/menu/IconChatOneOnOneSmall.svg' },
  { id: 'groups', label: 'Groups', icon: '/icons/menu/IconPerson2.svg' },
  { id: 'threads', label: 'Threads', icon: '/icons/menu/IconArrowTurnUpLeftSmall.svg' },
  { id: 'meetings', label: 'Meetings', icon: '/icons/menu/IconVideoCameraSparkle.svg' },
  { id: 'guests', label: 'Guests', icon: '/icons/menu/IconPersonPass.svg' },
  { id: 'bookmarks', label: 'Bookmarks', icon: '/icons/menu/IconBookmark.svg' },
  'divider',
  { id: 'actions', label: 'My Action Items', icon: '/icons/mm-task.svg' },
];

const SIDEBAR_VIEW_LABELS = SIDEBAR_VIEW_ITEMS.reduce((acc, v) => {
  if (v !== 'divider') acc[v.id] = v.label;
  return acc;
}, {});

// ──────────────────────────────────────────────────────────────────────
// Activity view — matches the Figma (node 39541:34085). A featured-users
// strip at the top and a chronological list of activity rows below.
// ──────────────────────────────────────────────────────────────────────
const ACTIVITY_FEATURED = [
  { name: 'Will', avatar: '/headshots/will-hou.jpg', tooltip: 'What happened on this call before' },
  { name: 'Howard', avatar: '/headshots/howard-lerman.jpg' },
  { name: 'Design', groupImg: '/groups/Group Design.png', cornerAvatar: '/headshots/grace-sutherland.jpg', tooltip: 'Can we do this' },
];

const ACTIVITY_ITEMS = [
  { kind: 'row', chatId: 'act-bugs', icon: '/groups/Group Bug Report.png', name: 'Bug Reports', sub: 'Roam Bug Reports: New bug from the',
    chat: { type: 'group', name: 'Bug Reports', memberCount: 4, groupImg: '/groups/Group Bug Report.png', avatars: ['/headshots/derek-cicerone.jpg', '/headshots/keegan-lanzillotta.jpg', '/headshots/rob-figueiredo.jpg'],
      messages: [
        { id: 1, sender: 'Roam Bug Reports', avatar: '/groups/Group Bug Report.png', time: 'Today 9:41 AM', text: 'New bug from Chelsea: AInbox thread typing indicator shows two avatars at once when a reply lands mid-typing. Repro in the linked issue.' },
        { id: 2, sender: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', time: '9:44 AM', text: "On it. Smells like a state reset that's not firing after sendMessage." },
        { id: 3, sender: 'Keegan Lanzillotta', avatar: '/headshots/keegan-lanzillotta.jpg', time: '9:48 AM', text: 'Another one: Drop-In audio cuts for ~200ms on Bluetooth handoff. iPhone 15 Pro + AirPods Pro 2.' },
        { id: 4, sender: 'Rob Figueiredo', avatar: '/headshots/rob-figueiredo.jpg', time: '9:52 AM', text: "Reproduced on my end. I'll file it under audio-routing — feels like a regression from the CoreAudio refactor." },
        { id: 5, sender: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', time: '10:01 AM', text: 'Typing bug fix up for review: https://github.com/roam/app/pull/4812 — should land today.' },
        { id: 6, sender: 'Roam Bug Reports', avatar: '/groups/Group Bug Report.png', time: '10:14 AM', text: 'New bug from Will: Theater reactions double-counting when two people react within the same animation frame.' },
        { id: 7, sender: 'Keegan Lanzillotta', avatar: '/headshots/keegan-lanzillotta.jpg', time: '10:18 AM', text: 'Seen that one before. Likely the reducer coalesce — I can take it.' },
      ] } },
  { kind: 'row', chatId: 'act-klas', avatar: '/headshots/klas-leino.jpg', online: true, name: 'Klas Leino', sub: "Running the new Claude Opus 4.7 against our eval set — first numbers are in and they're wild.",
    chat: { type: 'dm', name: 'Klas Leino', subtitle: 'Active now', avatar: '/headshots/klas-leino.jpg',
      messages: [
        { id: 1, self: false, text: "Running the new Claude Opus 4.7 against our eval set — first numbers are in and they're wild." },
        { id: 2, self: true, text: 'how does it compare to 4.6?' },
        { id: 3, self: false, text: '40% fewer hallucinations on the multi-thread condensation benchmark. And faster — median 1.8s vs 2.3s.' },
        { id: 4, self: true, text: 'wait, on the long-meeting Magic Minutes set too?' },
        { id: 5, self: false, text: "Yeah. Extended thinking on a 90-min transcript and it nails the action items — no more merging two people's asks into one." },
        { id: 6, self: true, text: 'huge. any regressions?' },
        { id: 7, self: false, text: "Slight uptick in verbosity on short DMs. I'm tuning the system prompt to pull it back." },
        { id: 8, self: true, text: 'ok. ship to staging?' },
        { id: 9, self: false, text: "Rolling it out tonight. If the numbers hold through the week we flip the default for everyone Monday." },
      ] } },
  { kind: 'row', chatId: 'act-hkm', avatars: ['/headshots/howard-lerman.jpg', '/headshots/klas-leino.jpg', '/headshots/michael-miller.jpg'], name: 'Howard, Klas & Michael', sub: "Hey there! I just finished working on a new logo design for a client, and I'm really excited about how it turned out.",
    chat: { type: 'group', name: 'Howard, Klas & Michael', memberCount: 3, groupImg: '/headshots/howard-lerman.jpg', avatars: ['/headshots/howard-lerman.jpg', '/headshots/klas-leino.jpg', '/headshots/michael-miller.jpg'],
      messages: [
        { id: 1, sender: 'Klas Leino', avatar: '/headshots/klas-leino.jpg', time: 'Today 10:02 AM', text: "Just finished the first pass of the new logo direction. Want a quick look before I send it wider?" },
        { id: 2, sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: '10:04 AM', text: 'Yes, drop it.' },
        { id: 3, sender: 'Michael Miller', avatar: '/headshots/michael-miller.jpg', time: '10:06 AM', text: 'Same. I can review in the next 20 min.' },
        { id: 4, sender: 'Klas Leino', avatar: '/headshots/klas-leino.jpg', time: '10:09 AM', text: "Three concepts: (1) the classic Roam circle tightened up, (2) a typography-first treatment, (3) an abstract door motif." },
        { id: 5, sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: '10:12 AM', text: '(3) instantly. The door is the story.' },
        { id: 6, sender: 'Michael Miller', avatar: '/headshots/michael-miller.jpg', time: '10:14 AM', text: 'Agree on (3). The motif scales down to the favicon way better than (2).' },
        { id: 7, sender: 'Klas Leino', avatar: '/headshots/klas-leino.jpg', time: '10:18 AM', text: "Perfect. I'll refine (3) and post variants tomorrow morning." },
        { id: 8, sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: '10:19 AM', text: 'Thanks team. This feels right.' },
      ] } },
  { kind: 'row', chatId: 'act-derek', avatar: '/headshots/derek-cicerone.jpg', unread: true, emphasis: true, name: 'Derek Cicerone', sub: 'I attended a design conference yesterday, and it was incredibly inspiring',
    chat: { type: 'dm', name: 'Derek Cicerone', subtitle: 'Active now', avatar: '/headshots/derek-cicerone.jpg',
      messages: [
        { id: 1, self: false, text: 'I attended a design conference yesterday, and it was incredibly inspiring.' },
        { id: 2, self: false, text: 'Tons of ideas I want to try on the AInbox composer.' },
      ] } },
  { kind: 'row', chatId: 'act-michael', avatar: '/headshots/michael-miller.jpg', unread: true, emphasis: true, name: 'Michael Miller', sub: 'I recently discovered a fantastic design tool that has revolutionized my workflow. Its intuitive interface and powerful features make creating prototypes a breeze',
    chat: { type: 'dm', name: 'Michael Miller', subtitle: 'Active now', avatar: '/headshots/michael-miller.jpg',
      messages: [
        { id: 1, self: false, text: 'I recently discovered a fantastic design tool that has revolutionized my workflow. Intuitive, fast, and the prototypes feel real.' },
      ] } },
  { kind: 'row', chatId: 'act-features', icon: '/groups/Group Features.png', name: 'New Feature Requests', sub: "Frank Cork: Would love multi-cursor collaboration in Magicast",
    chat: { type: 'group', name: 'New Feature Requests', memberCount: 12, groupImg: '/groups/Group Features.png', avatars: ['/headshots/chelsea-turbin.jpg', '/headshots/jon-brod.jpg', '/headshots/grace-sutherland.jpg'],
      messages: [
        { id: 1, sender: 'Frank Cork', avatar: '/headshots/john-beutner.jpg', time: 'Today 11:12 AM', text: "Request from a big account: multi-cursor collaboration in Magicast. They want two people trimming a recording together." },
        { id: 2, sender: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', time: '11:14 AM', text: "+1 from customer success. We've heard this from at least four orgs this quarter." },
        { id: 3, sender: 'Jon Brod', avatar: '/headshots/jon-brod.jpg', time: '11:17 AM', text: 'Parking for Q3 unless it becomes a deal-breaker.' },
        { id: 4, sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', time: '11:20 AM', text: "Another ask: custom emoji reactions in Theater. I'd pair it with the reaction tray redesign we already have queued." },
        { id: 5, sender: 'Frank Cork', avatar: '/headshots/john-beutner.jpg', time: '11:24 AM', text: 'Also — dark-mode for the guest landing page. Customers keep screenshotting it mismatched with their dashboards.' },
        { id: 6, sender: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', time: '11:31 AM', text: 'Noted. Adding all three to the triage doc and flagging for the Q3 planning thread.' },
      ] } },
  { kind: 'row', chatId: 'act-tom', avatar: '/headshots/tom-dixon.jpg', name: 'Tom Dixon', sub: 'Pushed the new onboarding flow to staging',
    chat: { type: 'dm', name: 'Tom Dixon', subtitle: 'Active now', avatar: '/headshots/tom-dixon.jpg',
      messages: [
        { id: 1, self: false, text: "Pushed the new onboarding flow to staging — three screens, no friction. Try it when you get a minute." },
        { id: 2, self: true, text: 'Just poked at it. The progress indicator at the top feels like the star of the show.' },
        { id: 3, self: false, text: 'Ha, that was Grace insisting. I fought her for five minutes and she was right.' },
        { id: 4, self: true, text: 'Also: the empty state on screen 2 — any chance we can swap the illustration for something more office-y?' },
        { id: 5, self: false, text: "Already thinking it. I'll pair with Klas tomorrow." },
      ] } },
  { kind: 'row', chatId: 'act-computer', icon: '/groups/Group Computer.png', name: 'Computer People', sub: 'Jeff Grossman: M4 Max benchmarks are nuts',
    chat: { type: 'group', name: 'Computer People', memberCount: 6, groupImg: '/groups/Group Computer.png', avatars: ['/headshots/jeff-grossman.jpg', '/headshots/klas-leino.jpg'],
      messages: [
        { id: 1, sender: 'Jeff Grossman', avatar: '/headshots/jeff-grossman.jpg', time: 'Today 12:04 PM', text: "M4 Max benchmarks are out and they're nuts. Geekbench 6 ST is hitting 3,900." },
        { id: 2, sender: 'Klas Leino', avatar: '/headshots/klas-leino.jpg', time: '12:06 PM', text: 'Unified memory at 128GB is the real story for us. Finally enough headroom to run bigger local models during dev.' },
        { id: 3, sender: 'Rob Figueiredo', avatar: '/headshots/rob-figueiredo.jpg', time: '12:09 PM', text: 'Meanwhile my Framework 16 just arrived. Linux and I are about to become very close again.' },
        { id: 4, sender: 'Jeff Grossman', avatar: '/headshots/jeff-grossman.jpg', time: '12:11 PM', text: 'lol welcome back. bring snacks for the kernel-update meetings.' },
        { id: 5, sender: 'Michael Miller', avatar: '/headshots/michael-miller.jpg', time: '12:14 PM', text: "Anyone else tried the new ARM Windows build on Snapdragon X Elite? Battery's actually respectable now." },
        { id: 6, sender: 'Klas Leino', avatar: '/headshots/klas-leino.jpg', time: '12:17 PM', text: "Yeah — still some Electron pain, but it's within a day of shipping Roam natively on ARM Windows." },
        { id: 7, sender: 'Jeff Grossman', avatar: '/headshots/jeff-grossman.jpg', time: '12:19 PM', text: 'Ok giving Dell the benefit of the doubt one more time this year 😤' },
      ] } },
  { kind: 'header', label: 'Yesterday' },
  { kind: 'row', chatId: 'act-apple', icon: '/groups/Group Apple.png', active: true, name: 'Apple', sub: 'Tim Apple: The new iOS is the best',
    chat: { type: 'group', name: 'Apple', memberCount: 5, groupImg: '/groups/Group Apple.png', avatars: ['/headshots/howard-lerman.jpg'],
      messages: [
        { id: 1, sender: 'Tim Apple', avatar: '/groups/Group Apple.png', time: 'Yesterday 3:14 PM', text: 'The new iOS is the best.' },
      ] } },
  { kind: 'row', chatId: 'act-robert', avatar: '/headshots/rob-figueiredo.jpg', name: 'Robert Fox', sub: 'Just booked flights for Lisbon. Five days in May.',
    chat: { type: 'dm', name: 'Robert Fox', subtitle: 'Last active yesterday', avatar: '/headshots/rob-figueiredo.jpg',
      messages: [
        { id: 1, self: false, text: 'Just booked flights for Lisbon. Five days in May — taking the family. 🇵🇹' },
        { id: 2, self: true, text: 'Amazing. Staying in Alfama?' },
        { id: 3, self: false, text: "Yeah, that little airbnb near the miradouro I told you about. Kid's already asking about pastéis." },
        { id: 4, self: true, text: 'Lol. Do the day trip to Sintra if you can. Pena Palace is a whole thing.' },
        { id: 5, self: false, text: "Already on the list. Any food spots I shouldn't miss?" },
        { id: 6, self: true, text: 'Cervejaria Ramiro for seafood. Non-negotiable.' },
      ] } },
  { kind: 'row', chatId: 'act-brooklyn', avatar: '/headshots/chelsea-turbin.jpg', name: 'Brooklyn Simmons', sub: 'Venue locked in! June 15th, Hudson Valley.',
    chat: { type: 'dm', name: 'Brooklyn Simmons', subtitle: 'Last active yesterday', avatar: '/headshots/chelsea-turbin.jpg',
      messages: [
        { id: 1, self: false, text: 'Venue locked in! June 15th, Hudson Valley. 💍' },
        { id: 2, self: true, text: 'Congrats!! That timeline moved fast.' },
        { id: 3, self: false, text: "I know. Once we saw it we didn't want to wait. Outdoor ceremony, then dinner in the barn." },
        { id: 4, self: true, text: 'The photos are going to be unreal.' },
        { id: 5, self: false, text: "Save the dates go out next week. Don't even think about skipping it 😂" },
        { id: 6, self: true, text: "I'll be there front row." },
      ] } },
  { kind: 'row', chatId: 'act-jenny', avatar: '/headshots/lexi-bohonnon.jpg', name: 'Jenny Wilson', sub: 'Finally finished the sourdough starter',
    chat: { type: 'dm', name: 'Jenny Wilson', subtitle: 'Last active yesterday', avatar: '/headshots/lexi-bohonnon.jpg',
      messages: [
        { id: 1, self: false, text: 'Finally finished the sourdough starter. Day 7. She lives.' },
        { id: 2, self: false, text: 'I named her Bubbles.' },
        { id: 3, self: true, text: 'Lmao. Did the first loaf come out good?' },
        { id: 4, self: false, text: "Crumb is perfect. Crust is almost right — I need a hotter dutch oven." },
        { id: 5, self: true, text: 'Drop a slice by the office and I will personally validate.' },
        { id: 6, self: false, text: "Deal. Friday I'll bring a whole one." },
      ] } },
  { kind: 'row', chatId: 'act-leslie', avatar: '/headshots/aaron-wadhwa.jpg', name: 'Leslie Alexander', sub: 'First 10k on Sunday. I might actually die.',
    chat: { type: 'dm', name: 'Leslie Alexander', subtitle: 'Last active yesterday', avatar: '/headshots/aaron-wadhwa.jpg',
      messages: [
        { id: 1, self: false, text: 'First 10k on Sunday. I might actually die.' },
        { id: 2, self: true, text: "You're not going to die. You've been training for what, 12 weeks?" },
        { id: 3, self: false, text: '14. Longest run was 8.5 a week ago.' },
        { id: 4, self: true, text: "You're in. Just go out slow, finish strong. Pace chart is your friend." },
        { id: 5, self: false, text: "Spectators wanted. I'll need someone holding a sign with my face on it at the 8k mark." },
        { id: 6, self: true, text: "I will personally laminate it." },
      ] } },
];

function ActivityRow({ item, selected, onSelect }) {
  return (
    <div
      className={`ainbox-activity-row ${selected ? 'ainbox-activity-row-active' : ''}`}
      onClick={onSelect}
    >
      {item.unread && <div className="ainbox-activity-row-unread" />}
      <div className="ainbox-activity-row-avatar">
        {item.avatars ? (
          <div className="ainbox-activity-row-stack">
            {item.avatars.map((src, i) => (
              <img key={i} src={src} alt="" className={`ainbox-activity-row-stack-img ainbox-activity-row-stack-${i}`} />
            ))}
          </div>
        ) : item.icon ? (
          <img src={item.icon} alt="" className="ainbox-activity-row-img" />
        ) : (
          <img src={item.avatar} alt="" className="ainbox-activity-row-img" />
        )}
        {item.online && <div className="ainbox-activity-row-online" />}
      </div>
      <div className="ainbox-activity-row-labels">
        <div className={`ainbox-activity-row-name ${item.emphasis ? 'ainbox-activity-row-name-bold' : ''}`}>{item.name}</div>
        <div className="ainbox-activity-row-sub">{item.sub}</div>
      </div>
    </div>
  );
}

const INJECTABLE_ACTIVITY = [
  { kind: 'row', chatId: 'inj-mattias', avatar: '/headshots/mattias-leino.jpg', unread: true, emphasis: true, name: 'Mattias Leino', sub: 'New evals just landed — the agent is hitting 94% on the multi-step planning set.',
    chat: { type: 'dm', name: 'Mattias Leino', subtitle: 'Active now', avatar: '/headshots/mattias-leino.jpg',
      messages: [
        { id: 1, self: false, text: 'New evals just landed — the agent is hitting 94% on the multi-step planning set.' },
        { id: 2, self: true, text: 'wait, 94? what was the last baseline?' },
        { id: 3, self: false, text: '81. The chain-of-thought prompt rewrite did most of it — bigger gain than the model swap.' },
        { id: 4, self: true, text: "that's a huge jump. where does it still fall over?" },
        { id: 5, self: false, text: 'Long-horizon tasks with 10+ tool calls. Drifts on state midway. I think we need a scratchpad memory.' },
        { id: 6, self: true, text: "makes sense. let's spec it tomorrow?" },
        { id: 7, self: false, text: "Perfect, that works for me." },
      ] } },
  { kind: 'row', chatId: 'inj-chelsea', avatar: '/headshots/chelsea-turbin.jpg', unread: true, emphasis: true, name: 'Chelsea Turbin', sub: 'Customer wants Magic Minutes to summarize their last 30 meetings into one doc. Can we?',
    chat: { type: 'dm', name: 'Chelsea Turbin', subtitle: 'Active now', avatar: '/headshots/chelsea-turbin.jpg',
      messages: [
        { id: 1, self: false, text: 'Customer wants Magic Minutes to summarize their last 30 meetings into one doc. Can we?' },
        { id: 2, self: true, text: 'which customer?' },
        { id: 3, self: false, text: "Linear. They're using Roam for weekly product reviews and want a Q1 recap doc pulled from the transcripts." },
        { id: 4, self: true, text: "that's actually a killer use case. we can chain Magic Minutes summaries into a rollup." },
        { id: 5, self: false, text: 'Yeah exactly. Want me to write it up as a feature request?' },
        { id: 6, self: true, text: 'yes — tag it "multi-meeting rollup" and cc Klas' },
        { id: 7, self: false, text: 'On it 🚀' },
      ] } },
  { kind: 'row', chatId: 'inj-grace', avatar: '/headshots/grace-sutherland.jpg', unread: true, emphasis: true, name: 'Grace Sutherland', sub: 'Wrote the entire launch script with the AInbox composer — it nailed the voice on the first pass 👀',
    chat: { type: 'dm', name: 'Grace Sutherland', subtitle: 'Active now', avatar: '/headshots/grace-sutherland.jpg',
      messages: [
        { id: 1, self: false, text: 'Wrote the entire launch script with the AInbox composer — it nailed the voice on the first pass 👀' },
        { id: 2, self: true, text: 'no way. which prompt?' },
        { id: 3, self: false, text: "Just fed it the last three launch posts and said 'match this energy'. One-shot." },
        { id: 4, self: true, text: "that's wild. how's the VO read?" },
        { id: 5, self: false, text: "Tight. I trimmed like 4 lines. Otherwise the rhythm was already there." },
        { id: 6, self: true, text: 'send me the cut when it renders' },
        { id: 7, self: false, text: 'ETA 20 min 🎬' },
      ] } },
  { kind: 'row', chatId: 'inj-jeff', avatar: '/headshots/jeff-grossman.jpg', unread: true, emphasis: true, name: 'Jeff Grossman', sub: 'Local inference on the M4 Max is running 3x faster than the cloud baseline. Unreal.',
    chat: { type: 'dm', name: 'Jeff Grossman', subtitle: 'Active now', avatar: '/headshots/jeff-grossman.jpg',
      messages: [
        { id: 1, self: false, text: 'Local inference on the M4 Max is running 3x faster than the cloud baseline. Unreal.' },
        { id: 2, self: true, text: 'on which model?' },
        { id: 3, self: false, text: "The quantized 70B we've been testing. Token throughput is hitting 42/s on-device." },
        { id: 4, self: true, text: "ok that changes the story for offline mode." },
        { id: 5, self: false, text: 'Exactly what I was thinking. We could ship full AInbox summarization without a round-trip.' },
        { id: 6, self: true, text: "let's demo it at next week's all-hands" },
        { id: 7, self: false, text: '👍 building the demo now.' },
      ] } },
];

function InjectedRow({ item, selected, onSelect }) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(raf2);
    });
    return () => cancelAnimationFrame(raf1);
  }, []);
  return (
    <div className={`ainbox-activity-row-wrap ${entered ? 'ainbox-activity-row-wrap-entered' : ''}`}>
      <ActivityRow item={item} selected={selected} onSelect={onSelect} />
    </div>
  );
}

function ActivityView({ selectedChat, onSelect, injected = [] }) {
  return (
    <div className="ainbox-activity">
      <div className="ainbox-favorites">
        {ACTIVITY_FEATURED.map(f => (
          <div key={f.name} className="ainbox-fav-item">
            {f.groupImg ? (
              <img src={f.groupImg} alt="" className="ainbox-fav-avatar" />
            ) : (
              <img src={f.avatar} alt="" className="ainbox-fav-avatar" />
            )}
            <span className="ainbox-fav-name">{f.name}</span>
          </div>
        ))}
      </div>
      <div className="ainbox-activity-list">
        {injected.map((it) => (
          <InjectedRow
            key={it.chatId}
            item={it}
            selected={selectedChat === it.chatId}
            onSelect={() => onSelect(it)}
          />
        ))}
        {ACTIVITY_ITEMS.map((it, i) => {
          if (it.kind === 'header') {
            return (
              <div key={`h-${i}`} className="ainbox-activity-section">
                <div className="ainbox-activity-section-sep" />
                <div className="ainbox-activity-section-label">{it.label}</div>
              </div>
            );
          }
          return (
            <ActivityRow
              key={it.chatId}
              item={it}
              selected={selectedChat === it.chatId}
              onSelect={() => onSelect(it)}
            />
          );
        })}
      </div>
    </div>
  );
}

const THREAD_REACTIONS = [
  { emoji: '👍', count: 6 }, { emoji: '✅', count: 4 },
  { emoji: '🔥', count: 3, active: true }, { emoji: '🚀', count: 5 }, { emoji: '💯', count: 2 },
];

const ACTION_ITEMS = [
  {
    id: 'a1', done: false,
    title: 'Approve Frankfurt region spend',
    date: 'Today',
    desc: 'Sign off in #ops so Lexi can provision the EU bucket Thursday and EU residency ships day-one with Magic Minutes GA.',
    assignee: '/headshots/joe-woodward.jpg',
  },
  {
    id: 'a2', done: false,
    title: 'Land cloud summarizer fallback',
    date: 'Today',
    desc: 'Wire up the cloud path for meetings over 30 minutes so the on-device pipeline degrades gracefully on long calls.',
    assignee: '/headshots/joe-woodward.jpg',
  },
  {
    id: 'a3', done: true,
    title: 'Auto-assign action items with one-click undo',
    date: 'Yesterday',
    desc: "Confirmed the auto-assign default for Magic Minutes summaries — owners are inferred from the transcript and an undo button surfaces in the meeting's group chat.",
    assignee: '/headshots/joe-woodward.jpg',
  },
  {
    id: 'a4', done: true,
    title: 'Walk activity-view loading states with design',
    date: 'Yesterday',
    desc: 'Reviewed the empty/skeleton/loaded transitions for the Activity view onboarding tour. Recording posted in the AInbox.',
    assignee: '/headshots/joe-woodward.jpg',
  },
  {
    id: 'a5', done: true,
    title: 'Run privacy review with legal',
    date: 'Apr 21',
    desc: 'Reviewed the Stop & Shred deletion paths with legal so the privacy docs publish alongside Magic Minutes GA — sign-off captured in the meeting transcript.',
    assignee: '/headshots/joe-woodward.jpg',
  },
  {
    id: 'a6', done: true,
    title: 'Send data-flow diagram to Grace',
    date: 'Apr 21',
    desc: 'Diagram covers what Stop & Shred deletes downstream — recording, transcript, summary, auto-generated chat — and the 7-day backup tombstone window.',
    assignee: '/headshots/joe-woodward.jpg',
  },
  {
    id: 'a7', done: true,
    title: 'Lock GA launch checklist',
    date: 'Apr 21',
    desc: 'Posted the locked checklist in #magic-minutes-launch. Risks land in the thread before EOD Wednesday for triage in Friday\'s review.',
    assignee: '/headshots/joe-woodward.jpg',
  },
];

function ActionItemsCheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ActionItemsChevronIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ActionItemsView() {
  const [items, setItems] = useState(ACTION_ITEMS);
  const toggle = (id) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, done: !it.done } : it)));
  };
  return (
    <>
      <div className="ainbox-detail-header">
        <div className="ainbox-detail-header-left">
          <img src="/headshots/joe-woodward.jpg" alt="" className="ainbox-detail-header-avatar" />
          <span className="ainbox-detail-header-name">Joe Woodward</span>
          <img src="/icons/roamaniac.svg" alt="" className="ainbox-action-verified" aria-hidden="true" />
          <span className="ainbox-action-meta">
            <span className="ainbox-action-meta-dot" /> Roam HQ <span>·</span> !nventors
          </span>
        </div>
      </div>
      <div className="ainbox-actions-list">
        {items.map((item) => (
          <div key={item.id} className={`ainbox-action-row ${item.done ? 'ainbox-action-row-done' : ''}`}>
            <button
              type="button"
              className="ainbox-action-check-btn"
              onClick={() => toggle(item.id)}
              aria-pressed={item.done}
              aria-label={item.done ? 'Mark task incomplete' : 'Mark task complete'}
            >
              <span
                className={`ainbox-action-check ${item.done ? 'ainbox-action-check-done' : ''}`}
                aria-hidden="true"
              />
            </button>
            <div className="ainbox-action-body">
              <div className="ainbox-action-title-row">
                <span className="ainbox-action-title">{item.title}</span>
                <span className="ainbox-action-date">{item.date}</span>
              </div>
              <p className="ainbox-action-desc">{item.desc}</p>
            </div>
            <button type="button" className="ainbox-action-assignee">
              <img src={item.assignee} alt="" />
              <ActionItemsChevronIcon />
            </button>
          </div>
        ))}
      </div>
      <div className="ainbox-actions-footer">
        <button type="button" className="ainbox-actions-new">
          <span>New Action Item</span>
        </button>
      </div>
    </>
  );
}

export default function AInbox({ win, onDrag, onOpenMagicMinutes, initialThreadView = null, initialChatId = null, initialSearchActive = false, initialSearchQuery = '', sidebarScrollToBottom = false, staticMode = false, autoAddFolders = false, favoritesOverride = null, sectionsOverride = null, messagesOverride = null, mmAutoPrompt = false, mmPrompts = null, initialSidebarView = 'inbox', initialCollapsedSections = null }) {
  const favorites = favoritesOverride || FAVORITES;
  const sidebarSections = sectionsOverride || SIDEBAR_SECTIONS;
  const defaultSelected = sidebarSections[0]?.items?.[0]?.id || 'design';
  const [selectedChat, setSelectedChat] = useState(initialChatId || initialThreadView?.chatId || (sectionsOverride ? defaultSelected : 'design'));
  const [collapsedSections, setCollapsedSections] = useState(initialCollapsedSections || {});
  const [inputText, setInputText] = useState('');
  const [sidebarView, setSidebarView] = useState(initialSidebarView);
  const [sidebarMenuOpen, setSidebarMenuOpen] = useState(false);
  const chatCtx = useChat();
  const pickRandom = chatCtx.pickRandom;
  const getReply = chatCtx.getReply;
  const [overrideMessages, setOverrideMessages] = useState(() => {
    if (!messagesOverride) return messagesOverride;
    if (initialChatId && initialChatId.startsWith('act-')) {
      const item = ACTIVITY_ITEMS.find(it => it.chatId === initialChatId);
      if (item?.chat && !messagesOverride[initialChatId]) {
        return { ...messagesOverride, [initialChatId]: item.chat };
      }
    }
    return messagesOverride;
  });
  const messages = messagesOverride ? overrideMessages : chatCtx.messages;
  const setMessages = messagesOverride ? setOverrideMessages : chatCtx.setMessages;
  const [injectedActivity, setInjectedActivity] = useState([]);
  const [activityInView, setActivityInView] = useState(false);
  const rootRef = useRef(null);
  useEffect(() => {
    if (sidebarView !== 'activity' || activityInView) return;
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting && e.intersectionRatio >= 0.35) {
          setActivityInView(true);
          io.disconnect();
          break;
        }
      }
    }, { threshold: [0, 0.35, 0.6, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, [sidebarView, activityInView]);
  useEffect(() => {
    if (sidebarView !== 'activity' || !activityInView) return;
    let i = 0;
    const id = setInterval(() => {
      if (i >= INJECTABLE_ACTIVITY.length) { clearInterval(id); return; }
      const next = INJECTABLE_ACTIVITY[i++];
      setInjectedActivity(prev => (prev.some(p => p.chatId === next.chatId) ? prev : [next, ...prev]));
    }, 3500);
    return () => clearInterval(id);
  }, [sidebarView, activityInView]);
  const [closing, setClosing] = useState(false);
  // threadView: null or { chatId, messageId }
  const [threadView, setThreadView] = useState(initialThreadView);
  const messagesRef = useRef(null);
  const composerInputRef = useRef(null);
  const [composerFocused, setComposerFocused] = useState(false);
  const shouldScroll = useRef(false);
  const sidebarSectionsRef = useRef(null);

  useEffect(() => {
    if (!sidebarScrollToBottom) return;
    const el = sidebarSectionsRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [sidebarScrollToBottom, sectionsOverride]);

  // Add-folder state
  const [addFolderName, setAddFolderName] = useState('');
  const [addedFolders, setAddedFolders] = useState([]);
  const addFolderInputRef = useRef(null);

  useEffect(() => {
    addFolderInputRef.current?.focus({ preventScroll: true });
  }, []);

  // Keep a stable ref to handleAddFolder for the auto-typer effect
  const handleAddFolderRef = useRef(null);
  handleAddFolderRef.current = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const POOL = [
      { id: 'p-howard', name: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', type: 'dm' },
      { id: 'p-jon', name: 'Jon Brod', avatar: '/headshots/jon-brod.jpg', type: 'dm' },
      { id: 'p-grace', name: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', type: 'dm' },
      { id: 'p-derek', name: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', type: 'dm' },
      { id: 'p-klas', name: 'Klas Leino', avatar: '/headshots/klas-leino.jpg', type: 'dm' },
      { id: 'p-mattias', name: 'Mattias Leino', avatar: '/headshots/mattias-leino.jpg', type: 'dm' },
      { id: 'p-chelsea', name: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', type: 'dm' },
      { id: 'p-tom', name: 'Tom Dixon', avatar: '/headshots/tom-dixon.jpg', type: 'dm' },
      { id: 'p-lexi', name: 'Lexi Bohonnon', avatar: '/headshots/lexi-bohonnon.jpg', type: 'dm' },
      { id: 'p-will', name: 'Will Houseberry', avatar: '/headshots/will-hou.jpg', type: 'dm' },
      { id: 'p-rob', name: 'Rob Figueiredo', avatar: '/headshots/rob-figueiredo.jpg', type: 'dm' },
      { id: 'p-peter', name: 'Peter Lerman', avatar: '/headshots/peter-lerman.jpg', type: 'dm' },
      { id: 'g-design', name: 'Design', groupImg: '/groups/Group Design.png', type: 'group', memberCount: 35 },
      { id: 'g-eng', name: 'Engineering', groupImg: '/groups/Group Computer.png', type: 'group', memberCount: 12 },
      { id: 'g-roam', name: 'All-Hands', groupImg: '/groups/Group Roam.png', type: 'group', memberCount: 45 },
      { id: 'g-cx', name: 'Customer Experience', groupImg: '/groups/Group CX.png', type: 'group', memberCount: 6 },
      { id: 'g-gtm', name: 'GTM', groupImg: '/groups/Group GTM.png', type: 'group', memberCount: 9 },
      { id: 'g-exec', name: 'Exec', groupImg: '/groups/Group Exec.png', type: 'group', memberCount: 7 },
    ];
    const count = 3 + Math.floor(Math.random() * 3);
    const shuffled = [...POOL].sort(() => Math.random() - 0.5).slice(0, count);
    const folderId = 'added-' + Date.now() + '-' + Math.random();
    const items = shuffled.map((it, i) => ({ ...it, id: it.id + '-' + folderId + '-' + i }));
    setAddedFolders(prev => [...prev, { id: folderId, label: trimmed, items }]);
    setAddFolderName('');
    requestAnimationFrame(() => {
      const el = sidebarSectionsRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });
  };

  // Auto-add folders with typewriter effect
  useEffect(() => {
    if (!autoAddFolders) return;
    const NAMES = [
      'Q3 Launch', 'Sprint Retro', 'Design Reviews', 'Demo Day',
      'Coffee Buddies', 'Book Club', 'Hiring Loop', 'Customer Wins',
      'Ship-It Friday', 'Brand Refresh', 'Roadmap Q4', 'Lunch Crew',
      'Birthday Squad', 'Off-site Plan', 'Onboarding Buddies', 'Wellness',
    ];
    const shuffled = [...NAMES].sort(() => Math.random() - 0.5);
    let idx = 0;
    let cancelled = false;
    let timers = [];

    const runCycle = () => {
      if (cancelled) return;
      const name = shuffled[idx % shuffled.length];
      idx++;
      let charIdx = 0;
      const typeInterval = setInterval(() => {
        if (cancelled) { clearInterval(typeInterval); return; }
        charIdx++;
        setAddFolderName(name.slice(0, charIdx));
        if (charIdx >= name.length) {
          clearInterval(typeInterval);
          const submitT = setTimeout(() => {
            if (cancelled) return;
            handleAddFolderRef.current?.(name);
            const nextT = setTimeout(runCycle, 3000);
            timers.push(nextT);
          }, 600);
          timers.push(submitT);
        }
      }, 70);
      timers.push(typeInterval);
    };

    const startT = setTimeout(runCycle, 1500);
    timers.push(startT);

    return () => {
      cancelled = true;
      timers.forEach(t => { clearTimeout(t); clearInterval(t); });
    };
  }, [autoAddFolders]);

  const handleAddFolder = (nameOverride) => {
    const name = (nameOverride ?? addFolderName).trim();
    if (!name) return;
    const POOL = [
      { id: 'p-howard', name: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', type: 'dm' },
      { id: 'p-jon', name: 'Jon Brod', avatar: '/headshots/jon-brod.jpg', type: 'dm' },
      { id: 'p-grace', name: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', type: 'dm' },
      { id: 'p-derek', name: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', type: 'dm' },
      { id: 'p-klas', name: 'Klas Leino', avatar: '/headshots/klas-leino.jpg', type: 'dm' },
      { id: 'p-mattias', name: 'Mattias Leino', avatar: '/headshots/mattias-leino.jpg', type: 'dm' },
      { id: 'p-chelsea', name: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', type: 'dm' },
      { id: 'p-tom', name: 'Tom Dixon', avatar: '/headshots/tom-dixon.jpg', type: 'dm' },
      { id: 'p-lexi', name: 'Lexi Bohonnon', avatar: '/headshots/lexi-bohonnon.jpg', type: 'dm' },
      { id: 'p-will', name: 'Will Houseberry', avatar: '/headshots/will-hou.jpg', type: 'dm' },
      { id: 'p-rob', name: 'Rob Figueiredo', avatar: '/headshots/rob-figueiredo.jpg', type: 'dm' },
      { id: 'p-peter', name: 'Peter Lerman', avatar: '/headshots/peter-lerman.jpg', type: 'dm' },
      { id: 'g-design', name: 'Design', groupImg: '/groups/Group Design.png', type: 'group', memberCount: 35 },
      { id: 'g-eng', name: 'Engineering', groupImg: '/groups/Group Computer.png', type: 'group', memberCount: 12 },
      { id: 'g-roam', name: 'All-Hands', groupImg: '/groups/Group Roam.png', type: 'group', memberCount: 45 },
      { id: 'g-cx', name: 'Customer Experience', groupImg: '/groups/Group CX.png', type: 'group', memberCount: 6 },
      { id: 'g-gtm', name: 'GTM', groupImg: '/groups/Group GTM.png', type: 'group', memberCount: 9 },
      { id: 'g-exec', name: 'Exec', groupImg: '/groups/Group Exec.png', type: 'group', memberCount: 7 },
      { id: 'm-1', name: 'Friday review', type: 'meeting' },
      { id: 'm-2', name: 'Standup', type: 'meeting' },
    ];
    const count = 3 + Math.floor(Math.random() * 3); // 3-5
    const shuffled = [...POOL].sort(() => Math.random() - 0.5).slice(0, count);
    const folderId = 'added-' + Date.now();
    const items = shuffled.map((it, i) => ({ ...it, id: it.id + '-' + folderId + '-' + i }));
    setAddedFolders(prev => [...prev, { id: folderId, label: name, items }]);
    setAddFolderName('');
    // Keep the input focused so the user can keep adding folders
    setTimeout(() => addFolderInputRef.current?.focus({ preventScroll: true }), 0);
    // Scroll the sidebar to the bottom so the new folder is visible
    requestAnimationFrame(() => {
      const el = sidebarSectionsRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });
  };

  // Search state
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchActive, setSearchActive] = useState(initialSearchActive);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || (initialSearchActive ? 'messages tab' : ''));
  const [searchActiveTab, setSearchActiveTab] = useState('messages');
  const searchInputRef = useRef(null);
  const SEARCH_RECENTS = ['Howard Lerman', 'Design', 'Klas Leino', 'Figma Slides'];
  const runSearch = (q) => {
    setSearchQuery(q || 'messages tab');
    setSearchActive(true);
    setSearchFocused(false);
    setTimeout(() => searchInputRef.current?.blur(), 0);
  };
  const exitSearch = () => {
    setSearchActive(false);
    setSearchFocused(false);
    setSearchQuery('');
    setTimeout(() => searchInputRef.current?.blur(), 0);
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => win.close(), 200);
  };

  useEffect(() => {
    if (win.closeRequestId) handleClose();
  }, [win.closeRequestId]);

  const toggleSection = (id) => {
    setCollapsedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openThread = (chatId, messageId) => {
    setThreadView({ chatId, messageId });
  };

  const closeThread = () => {
    setThreadView(null);
  };

  // Check if user is near bottom before auto-scrolling
  const isNearBottom = () => {
    if (!messagesRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesRef.current;
    return scrollHeight - scrollTop - clientHeight < 80;
  };

  const hasRendered = useRef(false);

  useEffect(() => {
    if (!hasRendered.current) return; // skip initial render
    if (messagesRef.current && (shouldScroll.current || isNearBottom())) {
      messagesRef.current.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
      shouldScroll.current = false;
    }
  }, [messages]);

  // Scroll to bottom instantly on chat change or initial render
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
    hasRendered.current = true;
  }, [selectedChat]);

  // Focus composer on chat change (skip initial render)
  const hasFocused = useRef(false);
  useEffect(() => {
    if (!hasFocused.current) { hasFocused.current = true; return; }
    setTimeout(() => composerInputRef.current?.focus({ preventScroll: true }), 50);
  }, [selectedChat]);

  // Auto-type in DMs when opening a conversation
  const dmAutoTypeRef = useRef(null);
  useEffect(() => {
    if (staticMode) return;
    if (dmAutoTypeRef.current) clearTimeout(dmAutoTypeRef.current);
    const convoData = messages[selectedChat];
    if (!convoData || convoData.type !== 'dm') return;
    // Show typing after a brief pause
    dmAutoTypeRef.current = setTimeout(() => {
      setMessages(prev => {
        const c = prev[selectedChat];
        if (!c || c.type !== 'dm') return prev;
        return { ...prev, [selectedChat]: { ...c, typingAvatars: [c.avatar] } };
      });
      // Send message after typing
      dmAutoTypeRef.current = setTimeout(() => {
        setMessages(prev => {
          const c = prev[selectedChat];
          if (!c || c.type !== 'dm') return prev;
          const reply = {
            id: Date.now() + Math.random(),
            self: false,
            text: getReply(selectedChat),
          };
          return { ...prev, [selectedChat]: { ...c, typingAvatars: null, messages: [...c.messages, reply] } };
        });
        shouldScroll.current = true;
      }, 2000 + Math.random() * 2000);
    }, 800 + Math.random() * 1200);
    return () => { if (dmAutoTypeRef.current) clearTimeout(dmAutoTypeRef.current); };
  }, [selectedChat]);

  // Continuous typing + new replies inside the open thread
  useEffect(() => {
    if (staticMode) return;
    if (mmAutoPrompt) return;
    if (!threadView) return;
    const THREAD_PEOPLE = [
      { name: 'Aaron Wadhwa', avatar: '/headshots/aaron-wadhwa.jpg' },
      { name: 'John Beutner', avatar: '/headshots/john-beutner.jpg' },
      { name: 'John Huffsmith', avatar: '/headshots/john-huffsmith.jpg' },
      { name: 'Sean MacIsaac', avatar: '/headshots/sean-macisaac.jpg' },
      { name: 'Lexi Bohonnon', avatar: '/headshots/lexi-bohonnon.jpg' },
      { name: 'Garima Kewlani', avatar: '/headshots/garima-kewlani.jpg' },
      { name: 'Ava Lee', avatar: '/headshots/ava-lee.jpg' },
      { name: 'Michael Walrath', avatar: '/headshots/michael-walrath.jpg' },
      { name: 'Jeff Grossman', avatar: '/headshots/jeff-grossman.jpg' },
      { name: 'Tom Dixon', avatar: '/headshots/tom-dixon.jpg' },
      { name: 'Arnav Bansal', avatar: '/headshots/arnav-bansal.jpg' },
      { name: 'Thomas Grapperon', avatar: '/headshots/thomas-grapperon.jpg' },
    ];
    const THREAD_REPLIES = [
      "Incredible quarter — let's keep the foot on the gas.",
      "Customers love it. Pipeline has never looked stronger.",
      "Proud of this team. So much more to come.",
      "The energy in the office today is unreal 🚀",
      "Thank you to everyone who shipped this quarter.",
      "Just signed another logo this morning. Q2 is going to be wild.",
      "Honored to be part of this. Onward.",
      "This is just the beginning.",
      "Best team I've ever worked with. 🙌",
      "The product is finally clicking with everyone we demo to.",
      "Inbound has 4x'd. Sales — get ready.",
      "So much momentum. Let's not lose it.",
      "Massive shoutout to the platform team — infra didn't blink.",
      "Onboarding conversion is up across every cohort.",
      "Let's go. 🚀🚀🚀",
    ];

    let timers = [];
    let typing = false;
    let cancelled = false;

    const scheduleNext = (delay) => {
      const t = setTimeout(() => {
        if (cancelled || typing) return;
        const person = THREAD_PEOPLE[Math.floor(Math.random() * THREAD_PEOPLE.length)];
        typing = true;
        setMessages(prev => {
          const c = prev[threadView.chatId];
          if (!c) return prev;
          const tt = { ...(c.threadTypingAvatars || {}) };
          tt[threadView.messageId] = [person.avatar];
          return { ...prev, [threadView.chatId]: { ...c, threadTypingAvatars: tt } };
        });
        const sendT = setTimeout(() => {
          if (cancelled) return;
          typing = false;
          setMessages(prev => {
            const c = prev[threadView.chatId];
            if (!c) return prev;
            const reply = {
              id: 'r-auto-' + Date.now() + '-' + Math.random(),
              sender: person.name,
              avatar: person.avatar,
              text: THREAD_REPLIES[Math.floor(Math.random() * THREAD_REPLIES.length)],
            };
            const newMsgs = c.messages.map(m => {
              if (m.id !== threadView.messageId) return m;
              const t0 = m.thread || { count: 0, replies: [] };
              return {
                ...m,
                thread: {
                  ...t0,
                  count: (t0.count || 0) + 1,
                  lastReply: 'just now',
                  replies: [...(t0.replies || []), reply],
                },
              };
            });
            const tt = { ...(c.threadTypingAvatars || {}) };
            delete tt[threadView.messageId];
            return { ...prev, [threadView.chatId]: { ...c, messages: newMsgs, threadTypingAvatars: tt } };
          });
          shouldScroll.current = true;
          scheduleNext(2200 + Math.random() * 3500);
        }, 1800 + Math.random() * 2200);
        timers.push(sendT);
      }, delay);
      timers.push(t);
    };

    scheduleNext(2500);

    return () => {
      cancelled = true;
      timers.forEach(t => clearTimeout(t));
      // Clear typing for this thread on cleanup
      setMessages(prev => {
        const c = prev[threadView.chatId];
        if (!c || !c.threadTypingAvatars) return prev;
        const tt = { ...c.threadTypingAvatars };
        delete tt[threadView.messageId];
        return { ...prev, [threadView.chatId]: { ...c, threadTypingAvatars: tt } };
      });
    };
  }, [threadView?.chatId, threadView?.messageId, mmAutoPrompt]);

  // Continuous DM back-and-forth (only in override mode, only when DM is selected, no thread open)
  useEffect(() => {
    if (staticMode) return;
    if (!messagesOverride) return;
    if (threadView) return;
    const convoData = messages[selectedChat];
    if (!convoData || convoData.type !== 'dm') return;

    const PARTNER_LINES = {
      howard: [
        "Quick thought — what if we shipped the AI summary as a separate card under the meeting? Less noise, more scannable.",
        "Did you see the email from the SF team? They want to do a Roam-on-Roam case study.",
        "Heads up — board call moved to 3pm Thursday.",
        "Loved the Drop-In demo on the all-hands. People were stunned.",
        "Can we get the Magic Minutes share-to-Slack link into next sprint?",
        "I'm hearing great things from the design team. Whatever you're doing — keep doing it.",
      ],
    };
    const SELF_LINES = {
      howard: [
        "Yeah I think that's cleaner. I'll mock it up tomorrow.",
        "Just saw it. I'll forward to Grace — she's the right one to drive that.",
        "Got it, I'll move my conflict.",
        "Thank you 🙏 the team worked hard on that one.",
        "Already in — Rob picked it up this morning.",
        "Will do. Pulling together a doc this afternoon.",
      ],
    };
    const partnerLines = PARTNER_LINES[selectedChat];
    const selfLines = SELF_LINES[selectedChat];
    if (!partnerLines || !selfLines) return;

    const chatId = selectedChat;
    let timers = [];
    let cancelled = false;
    let turn = 0;

    const sendPartnerMessage = () => {
      if (cancelled) return;
      // Show typing indicator
      setMessages(prev => {
        const c = prev[chatId];
        if (!c) return prev;
        return { ...prev, [chatId]: { ...c, typingAvatars: [c.avatar] } };
      });
      const sendT = setTimeout(() => {
        if (cancelled) return;
        setMessages(prev => {
          const c = prev[chatId];
          if (!c) return prev;
          const text = partnerLines[Math.floor(Math.random() * partnerLines.length)];
          const reply = { id: 'auto-p-' + Date.now() + '-' + Math.random(), self: false, text };
          return { ...prev, [chatId]: { ...c, typingAvatars: null, messages: [...c.messages, reply] } };
        });
        const nextT = setTimeout(scheduleTurn, 2200 + Math.random() * 2000);
        timers.push(nextT);
      }, 1800 + Math.random() * 1800);
      timers.push(sendT);
    };

    const sendSelfMessage = () => {
      if (cancelled) return;
      setMessages(prev => {
        const c = prev[chatId];
        if (!c) return prev;
        const text = selfLines[Math.floor(Math.random() * selfLines.length)];
        const reply = { id: 'auto-s-' + Date.now() + '-' + Math.random(), self: true, text };
        return { ...prev, [chatId]: { ...c, messages: [...c.messages, reply] } };
      });
      const nextT = setTimeout(scheduleTurn, 1800 + Math.random() * 1800);
      timers.push(nextT);
    };

    const scheduleTurn = () => {
      if (cancelled) return;
      // Alternate: even turn = partner types and sends, odd turn = self sends
      if (turn % 2 === 0) sendPartnerMessage();
      else sendSelfMessage();
      turn++;
    };

    const startT = setTimeout(scheduleTurn, 2500);
    timers.push(startT);

    return () => {
      cancelled = true;
      timers.forEach(t => clearTimeout(t));
      setMessages(prev => {
        const c = prev[chatId];
        if (!c || !c.typingAvatars) return prev;
        return { ...prev, [chatId]: { ...c, typingAvatars: null } };
      });
    };
  }, [selectedChat, threadView, messagesOverride]);

  // Continuous auto-chat across all group conversations
  useEffect(() => {
    if (staticMode) return;
    if (messagesOverride) return;
    const AUTO_PEOPLE = {
      design: [
        { name: 'Will Houseberry', avatar: '/headshots/will-hou.jpg' },
        { name: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg' },
        { name: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg' },
        { name: 'Klas Leino', avatar: '/headshots/klas-leino.jpg' },
        { name: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg' },
      ],
      engineering: [
        { name: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg' },
        { name: 'Rob Figueiredo', avatar: '/headshots/rob-figueiredo.jpg' },
        { name: 'Keegan Lanzillotta', avatar: '/headshots/keegan-lanzillotta.jpg' },
      ],
      product: [
        { name: 'Joe Woodward', avatar: '/headshots/joe-woodward.jpg' },
        { name: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg' },
        { name: 'Jon Brod', avatar: '/headshots/jon-brod.jpg' },
      ],
      'all-hands': [
        { name: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg' },
        { name: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg' },
      ],
      ios: [
        { name: 'Keegan Lanzillotta', avatar: '/headshots/keegan-lanzillotta.jpg' },
        { name: 'John Moffa', avatar: '/headshots/john-moffa.jpg' },
      ],
      android: [
        { name: 'Arnav Bansal', avatar: '/headshots/arnav-bansal.jpg' },
        { name: 'Michael Miller', avatar: '/headshots/michael-miller.jpg' },
      ],
    };
    const AUTO_MESSAGES = {
      design: [
        "I just pushed the updated color tokens to the repo — can someone review?",
        "The new icon set is looking really sharp, nice work everyone.",
        "Quick note: the spacing on the card component needs a tweak before we ship.",
        "I've updated the Figma file with the new component variants.",
        "Let me know when you're free for a quick design review.",
        "The interaction pattern for the new dropdown feels way more intuitive now.",
        "Just exported the latest screens. The dark mode contrast ratios all pass WCAG AA.",
        "Should we use 8px or 12px corner radius on the new cards? I'm leaning 8px.",
        "The type scale looks so much better with the -0.3px letter-spacing on headings.",
        "Anyone tried the new squircle corners? They look amazing on the window frames.",
        "The shadow tokens are dialed in — subtle in dark mode, softer in light mode.",
        "I prototyped the new onboarding flow. Three screens, zero friction. Want to see it?",
      ],
      engineering: [
        "The performance improvements are live — page load is 40% faster.",
        "Heads up: I'm refactoring the auth module this afternoon.",
        "New PR is up for the WebSocket reconnection logic.",
        "The latest build is looking solid. All 4,000 tests pass in 45 seconds.",
        "Just fixed a memory leak in the chat module. Heap usage dropped 30%.",
        "The database migration script is ready. Rollback plan is tested.",
        "CI pipeline is 40% faster after parallelizing the test suites.",
        "Deployed the new rate limiter. Should handle 10x our current traffic.",
        "The TypeScript strict mode migration is done. No more any types.",
        "Found a race condition in the notification system. Fix is up for review.",
        "The new caching layer reduced API latency from 200ms to 15ms.",
        "Kubernetes autoscaling is configured. We can handle traffic spikes now.",
      ],
      product: [
        "The client loved the demo! They want to move forward.",
        "I'll write up the spec doc and share it by EOD.",
        "User research findings are in — the top request is better search.",
        "Q3 roadmap is locked. AInbox improvements are the #1 priority.",
        "Churn data shows teams using drop-in meetings retain 3x better.",
        "Competitive analysis is done. We're ahead on UX but need async features.",
        "The pricing experiment results are in. The $19.50 tier converts best.",
        "Just got off a call with a 500-person company. They're ready to pilot.",
        "Feature request volume is up 40% — that's a good sign for engagement.",
        "The NPS survey results are incredible. +72, up from +58 last quarter.",
        "We should do a customer webinar showcasing the new virtual office features.",
        "Sprint retro: shipped 14 features, zero P0 bugs. Best sprint yet.",
      ],
      'all-hands': [
        "Incredible month for the team. Revenue up, churn down, product shipping fast.",
        "Shoutout to engineering for the zero-downtime deployment last week.",
        "The design team's rebrand work is getting amazing feedback from customers.",
        "We're hiring! If anyone knows great engineers or designers, send them our way.",
        "Company offsite is confirmed for next month. Details coming soon.",
        "Marketing's latest campaign drove 12K signups in the first week.",
        "Customer satisfaction is at an all-time high. Keep up the amazing work.",
        "The board meeting went great. They're thrilled with our trajectory.",
        "New benefits package rolling out next quarter. HR will share details soon.",
        "Reminder: we're closed next Friday for the team wellness day.",
      ],
      ios: [
        "New TestFlight build is up. Focus on the chat threading flow.",
        "The haptic feedback on message reactions feels great on iPhone 15 Pro.",
        "Push notification permissions flow is fixed for iOS 18.",
        "Live Activities now show your current Roam room on the Dynamic Island.",
        "SwiftUI performance is much better after the lazy loading changes.",
        "The keyboard dismiss animation stutter is fixed. Smooth 60fps now.",
        "App Store screenshots need updating with the new UI. I'll handle it.",
        "Core Data migration went smoothly. No data loss in testing.",
        "The widget shows who's in the office. Users are going to love this.",
        "Crash-free rate is at 99.7%. Best we've ever had on iOS.",
      ],
      android: [
        "Material You dynamic colors are working perfectly with our design tokens.",
        "Battery usage is down 25% compared to last build.",
        "The notification channels rewrite is done. Much cleaner targeting now.",
        "Play Store listing needs new screenshots. I'll update after QA signs off.",
        "Bluetooth audio routing fix is confirmed working on Samsung and Pixel.",
        "The Compose UI migration is 80% done. Kotlin coroutines are so much cleaner.",
        "Background service optimization really paid off. No more battery complaints.",
        "Android 14+ deep linking is working. Users can join rooms from any link.",
        "The home screen widget is live. You can see who's online at a glance.",
        "Crash rate dropped to 0.1% after the null safety migration. Big win.",
      ],
    };
    const groupIds = Object.keys(AUTO_PEOPLE);
    let timers = [];

    const typing = {};

    function scheduleNext(chatId, delay) {
      const timer = setTimeout(() => {
        if (typing[chatId]) return; // already typing, skip
        const people = AUTO_PEOPLE[chatId];
        const person = pickRandom(people, 'person-' + chatId);
        typing[chatId] = person;
        // Show typing indicator
        setMessages(prev => {
          const convo = prev[chatId];
          if (!convo) return prev;
          return { ...prev, [chatId]: { ...convo, typingAvatars: [person.avatar] } };
        });
        // Send message after typing delay
        const sendTimer = setTimeout(() => {
          const p = typing[chatId];
          typing[chatId] = null;
          setMessages(prev => {
            const convo = prev[chatId];
            if (!convo) return prev;
            const msg = {
              id: Date.now() + Math.random(),
              sender: p.name,
              avatar: p.avatar,
              time: 'Just now',
              text: pickRandom(AUTO_MESSAGES[chatId] || AUTO_MESSAGES.design, 'msg-' + chatId),
            };
            return { ...prev, [chatId]: { ...convo, typingAvatars: null, messages: [...convo.messages, msg] } };
          });
          // Schedule the next person to start typing quickly
          scheduleNext(chatId, 1000 + Math.random() * 3000);
        }, 2000 + Math.random() * 3000);
        timers.push(sendTimer);
      }, delay);
      timers.push(timer);
    }

    // Stagger initial delays per group
    groupIds.forEach((id, i) => {
      scheduleNext(id, 4000 + i * 3000 + Math.random() * 5000);
    });

    return () => timers.forEach(t => clearTimeout(t));
  }, [staticMode, messagesOverride]);

  // Magic Minutes auto-prompt loop — drives the composer with typewriter
  // questions and injects MM replies directly into the active thread.
  useEffect(() => {
    if (!mmAutoPrompt || !threadView) return;
    const DEFAULT_PROMPTS = [
      {
        q: "@MagicMinutes please summarize this thread for me",
        a: "Q2 Planning in a nutshell: three priorities locked — AInbox redesign ships Friday, Magic Minutes becomes the demo headline, and enterprise onboarding gets tightened. Revenue is 18% ahead of plan and pipeline has 4x'd since the relaunch. Next review is Tuesday 10am with the execs.",
      },
      {
        q: "@MagicMinutes what action items came out of this meeting?",
        a: "Four: (1) Grace wraps the icon pass by Thursday EOD. (2) Derek flips the AInbox feature flag Friday morning — 10% rollout. (3) Jon drafts the customer-facing release note. (4) Chelsea sends a heads-up email to accounts still on the old API.",
      },
      {
        q: "@MagicMinutes what did Howard actually commit to?",
        a: "Howard committed to running the Friday all-hands demo personally, posting the launch note in #wins the moment it's live, and pinging the top 10 enterprise accounts individually over the weekend.",
      },
      {
        q: "@MagicMinutes any risks flagged in the meeting?",
        a: "Two: Klas flagged potential read-latency spikes on the new search index during rollout — infra is pre-warming caches to mitigate. Chelsea flagged that accounts on the old API will see a deprecation warning — CS is drafting a heads-up email.",
      },
      {
        q: "@MagicMinutes when is the next review?",
        a: "Tuesday 10am with the exec team. Scope: decide whether to push the AInbox rollout from 10% to 100%, and lock the Magic Minutes positioning for the spring push. Calendar invite already went out.",
      },
    ];
    const PROMPTS = mmPrompts && mmPrompts.length ? mmPrompts : DEFAULT_PROMPTS;

    let cancelled = false;
    let timers = [];
    let promptIdx = 0;
    let scheduled = false;

    const push = (t) => timers.push(t);

    const runCycle = () => {
      if (cancelled) return;
      const { q, a } = PROMPTS[promptIdx % PROMPTS.length];
      promptIdx += 1;
      setInputText('');

      // Typewriter the question into the composer
      let i = 0;
      const typeStep = () => {
        if (cancelled) return;
        i += 1;
        setInputText(q.slice(0, i));
        if (i < q.length) {
          push(setTimeout(typeStep, 18 + Math.random() * 18));
        } else {
          // Hold briefly, then "send": clear composer + inject the user's
          // question into the thread, then wait for Magic Minutes to reply.
          push(setTimeout(() => {
            if (cancelled) return;
            setInputText('');
            shouldScroll.current = true;
            setMessages(prev => {
              const c = prev[threadView.chatId];
              if (!c) return prev;
              const newMsgs = c.messages.map(m => {
                if (m.id !== threadView.messageId) return m;
                const existing = m.thread?.replies || [];
                const newReply = {
                  id: `mm-u-${Date.now()}`,
                  sender: 'You',
                  avatar: '/headshots/joe-woodward.jpg',
                  text: q,
                  isMention: true,
                };
                return {
                  ...m,
                  thread: { ...(m.thread || {}), replies: [...existing, newReply], count: existing.length + 1 },
                };
              });
              return { ...prev, [threadView.chatId]: { ...c, messages: newMsgs } };
            });

            // MM reply after a pause
            push(setTimeout(() => {
              if (cancelled) return;
              shouldScroll.current = true;
              setMessages(prev => {
                const c = prev[threadView.chatId];
                if (!c) return prev;
                const newMsgs = c.messages.map(m => {
                  if (m.id !== threadView.messageId) return m;
                  const existing = m.thread?.replies || [];
                  const newReply = {
                    id: `mm-a-${Date.now()}`,
                    sender: 'Magic Minutes',
                    isMM: true,
                    text: a,
                  };
                  return {
                    ...m,
                    thread: { ...(m.thread || {}), replies: [...existing, newReply], count: existing.length + 1 },
                  };
                });
                return { ...prev, [threadView.chatId]: { ...c, messages: newMsgs } };
              });

              // Hold briefly, then start the next cycle — leave the Q/A pair in place.
              push(setTimeout(runCycle, 1500));
            }, 800));
          }, 300));
        }
      };
      push(setTimeout(typeStep, 300));
    };

    const startT = setTimeout(runCycle, 500);
    timers.push(startT);

    return () => {
      cancelled = true;
      timers.forEach(t => clearTimeout(t));
    };
  }, [mmAutoPrompt, threadView?.chatId, threadView?.messageId, mmPrompts]);

  const convo = messages[selectedChat];

  const dmTimers = useRef({});

  const sendMessage = () => {
    if (!inputText.trim() || !convo) return;
    const chatId = selectedChat;
    const newMsg = (convo.type === 'group' || convo.type === 'meeting')
      ? { id: Date.now(), sender: 'You', avatar: '/headshots/joe-woodward.jpg', time: 'now', text: inputText.trim() }
      : { id: Date.now(), self: true, text: inputText.trim() };
    setMessages(prev => ({
      ...prev,
      [chatId]: { ...prev[chatId], messages: [...prev[chatId].messages, newMsg] },
    }));
    setInputText('');
    shouldScroll.current = true;

    // DM auto-reply
    if (convo.type === 'dm') {
      // Clear any existing timer for this chat
      if (dmTimers.current[chatId]) clearTimeout(dmTimers.current[chatId]);

      // Show typing after a short pause
      const typingTimer = setTimeout(() => {
        setMessages(prev => ({
          ...prev,
          [chatId]: { ...prev[chatId], typingAvatars: [prev[chatId].avatar] },
        }));

        // Send reply after typing
        const replyTimer = setTimeout(() => {
          setMessages(prev => {
            const c = prev[chatId];
            if (!c) return prev;
            const reply = {
              id: Date.now() + Math.random(),
              self: false,
              text: getReply(chatId),
            };
            return { ...prev, [chatId]: { ...c, typingAvatars: null, messages: [...c.messages, reply] } };
          });
        }, 1500 + Math.random() * 2500);
        dmTimers.current[chatId] = replyTimer;
      }, 800 + Math.random() * 1200);
      dmTimers.current[chatId] = typingTimer;
    }
  };

  // Group DM messages for consecutive same-sender bubbles
  const getDmGroups = (msgs) => {
    const result = [];
    for (let i = 0; i < msgs.length; i++) {
      const msg = msgs[i];
      const prev = msgs[i - 1];
      const isFirstInGroup = !prev || prev.type || prev.self !== msg.self || prev.group !== msg.group;
      const next = msgs[i + 1];
      const isLastInGroup = !next || next.type || next.self !== msg.self || next.group !== msg.group;
      result.push({ ...msg, isFirstInGroup, isLastInGroup });
    }
    return result;
  };

  return (
    <div
      ref={rootRef}
      className={`ainbox-window ${!win.isFocused ? 'ainbox-unfocused' : ''} ${closing ? 'ainbox-closing' : ''}`}
      style={{ left: win.position.x, top: win.position.y, zIndex: win.zIndex }}
      onMouseDown={() => { win.focus(); if (!mmAutoPrompt) setTimeout(() => composerInputRef.current?.focus({ preventScroll: true }), 50); }}
    >
      {/* ——— Title bar ——— */}
      <div className="ainbox-titlebar" onMouseDown={onDrag}>
        <div className="ainbox-traffic-lights">
          <div className="ainbox-light ainbox-light-close" onClick={(e) => { e.stopPropagation(); handleClose(); }} />
          <div className="ainbox-light ainbox-light-minimize" />
          <div className="ainbox-light ainbox-light-maximize" />
        </div>
        {searchActive && (
          <button
            className="ainbox-back-btn"
            onClick={(e) => { e.stopPropagation(); exitSearch(); }}
            onMouseDown={(e) => e.stopPropagation()}
            title="Back"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <div
          className={`ainbox-search ${searchFocused ? 'ainbox-search-focused' : ''} ${searchActive ? 'ainbox-search-pill' : ''}`}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => { if (!searchActive) searchInputRef.current?.focus(); }}
          style={!searchActive ? { cursor: 'text' } : undefined}
        >
          <span className="ainbox-search-leading-icon" aria-hidden="true" />
          {searchActive ? (
            <>
              <span className="ainbox-search-pill-label">{searchQuery || 'messages tab'}</span>
              <div className="ainbox-search-pill-actions">
                <button
                  type="button"
                  className="ainbox-search-pill-btn"
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onClick={(e) => { e.stopPropagation(); exitSearch(); }}
                  title="Clear search"
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="6" fill="currentColor" opacity="0.35"/><path d="M4.5 4.5L8.5 8.5M8.5 4.5L4.5 8.5" stroke="var(--bg-surface-elevated-primary, #1d1e20)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                </button>
                <button
                  type="button"
                  className="ainbox-search-pill-btn"
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onClick={(e) => e.stopPropagation()}
                  title="Filter"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M3.5 7h7M5 10.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                </button>
              </div>
            </>
          ) : (
            <input
              ref={searchInputRef}
              type="text"
              className="ainbox-search-input"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { runSearch(searchQuery); }
                if (e.key === 'Escape') { exitSearch(); }
              }}
            />
          )}
          {searchFocused && !searchActive && (
            <div className="ainbox-search-dropdown" onMouseDown={(e) => e.preventDefault()}>
              <div className="ainbox-search-dropdown-list">
                <div className="ainbox-search-dropdown-item" onClick={() => runSearch('')}>
                  <SearchClockIcon />
                  <span>New Chat</span>
                </div>
                {SEARCH_RECENTS.map((r) => (
                  <div key={r} className="ainbox-search-dropdown-item" onClick={() => runSearch(r)}>
                    <SearchClockIcon />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
              <div className="ainbox-search-dropdown-separator" />
              <div className="ainbox-search-dropdown-item ainbox-search-dropdown-advanced" onClick={() => runSearch('messages tab')}>
                <SearchSettingsIcon />
                <span>Advanced search...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ——— Body ——— */}
      <div className="ainbox-body">

        {/* ——— Sidebar ——— */}
        <div className="ainbox-sidebar">
          {/* Sidebar header */}
          <div className="ainbox-sidebar-header">
            <div
              className="ainbox-sidebar-header-left ainbox-view-pill"
              onClick={(e) => { e.stopPropagation(); setSidebarMenuOpen(o => !o); }}
            >
              <span className="ainbox-sidebar-title">{SIDEBAR_VIEW_LABELS[sidebarView] || 'AInbox'}</span>
              <svg
                className={`ainbox-view-pill-chevron ${sidebarMenuOpen ? 'ainbox-view-pill-chevron-open' : ''}`}
                width="12" height="12" viewBox="0 0 12 12" fill="none"
              >
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <img src="/icons/compose.svg" alt="" className="ainbox-compose-icon" />
            {sidebarMenuOpen && (
              <>
                <div className="ainbox-view-menu-backdrop" onClick={() => setSidebarMenuOpen(false)} />
                <div className="ainbox-view-menu" onClick={(e) => e.stopPropagation()}>
                  {SIDEBAR_VIEW_ITEMS.map((item, i) => {
                    if (item === 'divider') return <div key={`d-${i}`} className="ainbox-view-menu-divider" />;
                    const isActive = sidebarView === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`ainbox-view-menu-item ${isActive ? 'ainbox-view-menu-item-active' : ''}`}
                        onClick={() => { setSidebarView(item.id); setSidebarMenuOpen(false); }}
                      >
                        <span
                          className="ainbox-view-menu-icon"
                          aria-hidden="true"
                          style={{ WebkitMaskImage: `url(${item.icon})`, maskImage: `url(${item.icon})` }}
                        />
                        <span className="ainbox-view-menu-label">{item.label}</span>
                        {item.badge != null && <span className="ainbox-view-menu-badge">{item.badge}</span>}
                        {isActive && (
                          <svg className="ainbox-view-menu-check" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Scrollable sections */}
          <div className="ainbox-sections" ref={sidebarSectionsRef}>
            {sidebarView === 'activity' ? (
              <ActivityView
                selectedChat={selectedChat}
                injected={injectedActivity}
                onSelect={(it) => {
                  setMessages(prev => prev[it.chatId] ? prev : { ...prev, [it.chatId]: it.chat });
                  setSelectedChat(it.chatId);
                  setThreadView(null);
                }}
              />
            ) : (
              <>
            {/* Favorites row */}
            <div className="ainbox-favorites">
              {favorites.map(fav => (
                <div
                  key={fav.id}
                  className={`ainbox-fav-item ${selectedChat === fav.id ? 'ainbox-fav-active' : ''}`}
                  onClick={() => {
                    if (!messages[fav.id]) return;
                    setSelectedChat(fav.id);
                    setThreadView(null);
                  }}
                >
                  {fav.avatars ? (
                    <div className="ainbox-fav-group-avatar">
                      {fav.avatars.map((src, i) => (
                        <img key={i} src={src} alt="" className="ainbox-fav-group-img" style={{ zIndex: 2 - i }} />
                      ))}
                    </div>
                  ) : fav.id === 'onit' ? (
                    <div className="ainbox-fav-avatar ainbox-fav-avatar-onit">
                      <img src={fav.avatar} alt="" className="ainbox-fav-avatar-onit-img" />
                    </div>
                  ) : (
                    <img src={fav.avatar} alt="" className="ainbox-fav-avatar" />
                  )}
                  <span className="ainbox-fav-name">{fav.name}</span>
                </div>
              ))}
            </div>
            {[...sidebarSections, ...addedFolders].map(section => (
              <div key={section.id} className={`ainbox-section ${section.id?.startsWith('added-') ? 'ainbox-section-new' : ''}`}>
                <div className="ainbox-section-header" onClick={() => toggleSection(section.id)}>
                  <ChevronDown open={!collapsedSections[section.id]} className="ainbox-section-chevron" />
                  <span className="ainbox-section-label">{section.label}</span>
                </div>
                <div className={`ainbox-section-items-wrap ${collapsedSections[section.id] ? 'ainbox-section-items-collapsed' : ''}`}>
                  <div className="ainbox-section-items">
                    {section.items.map(item => (
                      <div
                        key={item.id}
                        className={`ainbox-section-item ${selectedChat === item.id ? 'ainbox-section-item-active' : ''}`}
                        onClick={() => {
                          if (item.threadRef) {
                            setSelectedChat(item.threadRef.chatId);
                            openThread(item.threadRef.chatId, item.threadRef.messageId);
                          } else if (messages[item.id]) {
                            setSelectedChat(item.id);
                            setThreadView(null);
                          }
                        }}
                      >
                        {item.groupImg ? (
                          <img src={item.groupImg} alt="" className="ainbox-section-item-avatar" />
                        ) : item.avatar ? (
                          <div className="ainbox-section-item-avatar-wrap">
                            <img src={item.avatar} alt="" className="ainbox-section-item-avatar" />
                            {item.online && <div className="ainbox-online-dot" />}
                          </div>
                        ) : (
                          <div className={`ainbox-section-item-icon ${(item.type === 'meeting' || item.type === 'thread') ? 'ainbox-section-item-icon-circle' : ''}`}>
                            {item.type === 'meeting' && (
                              <span className="ainbox-section-item-meeting-icon" aria-hidden="true" />
                            )}
                            {item.type === 'thread' && (
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 4H13M3 8H10M3 12H7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                            )}
                          </div>
                        )}
                        <span className="ainbox-section-item-name">{item.name}</span>
                      </div>
                    ))}
                    {section.id === 'groups' && (
                      <div className="ainbox-section-item ainbox-section-item-add">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                        <span className="ainbox-section-item-name">Add Group</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
              </>
            )}
          </div>
          {/* Add Folder — pinned to bottom of sidebar, outside the scroll area */}
          {sidebarView !== 'activity' && (
          <div className="ainbox-section-item ainbox-add-folder">
            <span className="ainbox-add-folder-icon">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </span>
            <input
              ref={addFolderInputRef}
              type="text"
              className="ainbox-add-folder-input"
              placeholder="Add Folder"
              value={addFolderName}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setAddFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddFolder();
                }
              }}
            />
          </div>
          )}
        </div>

        {/* ——— Detail pane ——— */}
        {(() => {
        const isOnitView = !threadView && convo?.type === 'onit';
        const composerEl = (
          <div className="ainbox-composer">
            {threadView
              ? convo?.threadTypingAvatars?.[threadView.messageId] && (
                  <TypingIndicator avatars={convo.threadTypingAvatars[threadView.messageId]} />
                )
              : convo?.typingAvatars && (
                  <TypingIndicator avatars={convo.typingAvatars} />
                )}
            <div className={`ainbox-composer-box ${composerFocused ? 'ainbox-composer-box-focused' : ''}`}>
              <div className={`ainbox-composer-field ${inputText.includes('@MagicMinutes') ? 'ainbox-composer-field-mm' : ''}`}>
                <input
                  ref={composerInputRef}
                  placeholder="Write a Message..."
                  value={inputText}
                  readOnly={mmAutoPrompt}
                  tabIndex={mmAutoPrompt ? -1 : 0}
                  onChange={(e) => { if (!mmAutoPrompt) setInputText(e.target.value); }}
                  onKeyDown={(e) => { if (!mmAutoPrompt && e.key === 'Enter') sendMessage(); }}
                  onFocus={() => setComposerFocused(true)}
                  onBlur={() => setComposerFocused(false)}
                />
                {inputText.includes('@MagicMinutes') && (
                  <div className="ainbox-composer-mm-overlay" aria-hidden="true">
                    {inputText.split(/(@MagicMinutes)/g).map((p, i) =>
                      p === '@MagicMinutes'
                        ? <span key={i} className="mm-mention">@MagicMinutes</span>
                        : <span key={i}>{p}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="ainbox-composer-toolbar">
                <div className="ainbox-toolbar-plus">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                <div className="ainbox-toolbar-group">
                  <img src="/icons/composer/Bold.svg" alt="" className="ainbox-toolbar-img" title="Bold" />
                  <img src="/icons/composer/Italic.svg" alt="" className="ainbox-toolbar-img" title="Italic" />
                  <img src="/icons/composer/Strikethrough.svg" alt="" className="ainbox-toolbar-img" title="Strikethrough" />
                  <img src="/icons/composer/Code Inline.svg" alt="" className="ainbox-toolbar-img" title="Code" />
                </div>
                <div className="ainbox-toolbar-divider" />
                <div className="ainbox-toolbar-group">
                  <img src="/icons/composer/Number List.svg" alt="" className="ainbox-toolbar-img" title="Numbered list" />
                  <img src="/icons/composer/Bullet List.svg" alt="" className="ainbox-toolbar-img" title="Bullet list" />
                  <img src="/icons/composer/Checklist.svg" alt="" className="ainbox-toolbar-img" title="Checklist" />
                  <img src="/icons/composer/Blockquotes.svg" alt="" className="ainbox-toolbar-img" title="Quote" />
                </div>
                <div className="ainbox-toolbar-divider" />
                <div className="ainbox-toolbar-group">
                  <img src="/icons/composer/Link.svg" alt="" className="ainbox-toolbar-img" title="Link" />
                </div>
                <div className="ainbox-toolbar-spacer" />
                <div className="ainbox-toolbar-group">
                  <img src="/icons/composer/Send.svg" alt="" className={`ainbox-toolbar-img ainbox-send-icon ${inputText.trim() ? 'ainbox-send-active' : ''}`} title="Send" onClick={() => { if (!mmAutoPrompt) sendMessage(); }} />
                </div>
              </div>
            </div>
          </div>
        );
        return (
        <div className={`ainbox-detail ${isOnitView ? 'ainbox-detail-onit' : ''}`}>
          {sidebarView === 'actions' && <ActionItemsView />}
          {sidebarView !== 'actions' && (
          <>
          {/* ——— Thread view ——— */}
          {threadView && (() => {
            const threadConvo = messages[threadView.chatId];
            const threadMsg = threadConvo?.messages.find(m => m.id === threadView.messageId);
            if (!threadConvo || !threadMsg || !threadMsg.thread) return null;
            return (
              <>
                {/* Thread header: breadcrumb */}
                <div className="ainbox-detail-header">
                  <div className="ainbox-detail-header-left">
                    {threadConvo.type === 'meeting' ? (
                      <div className="ainbox-detail-header-meeting-icon">
                        <img src={threadConvo.groupImg} alt="" className="ainbox-section-item-icon-img" />
                      </div>
                    ) : (
                      <img src={threadConvo.groupImg || threadConvo.avatars[0]} alt="" className="ainbox-detail-header-avatar" />
                    )}
                    <div className="ainbox-thread-breadcrumb">
                      <span className="ainbox-breadcrumb-group" onClick={closeThread}>{threadConvo.name}</span>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="ainbox-breadcrumb-chevron">
                        <path d="M4.5 2.5L7.5 6L4.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="ainbox-breadcrumb-current">Replies</span>
                    </div>
                  </div>
                  <div className="ainbox-detail-header-actions">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="3" r="1" fill="currentColor"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="8" cy="13" r="1" fill="currentColor"/></svg>
                  </div>
                </div>
                {/* Original message — pinned above the scrollable replies */}
                <div className="ainbox-thread-original ainbox-thread-original-pinned">
                  <div className="ainbox-thread-original-top">
                    <img src={threadMsg.avatar} alt="" className="ainbox-group-msg-avatar" />
                    <div className="ainbox-thread-original-info">
                      <span className="ainbox-thread-original-name">{threadMsg.sender}</span>
                      <span className="ainbox-thread-original-time">{threadMsg.time}</span>
                    </div>
                  </div>
                  <p className="ainbox-thread-original-text">{threadMsg.text}</p>
                  {threadMsg.attachment?.type === 'pdf' && (
                    <div className="ainbox-pdf-attachment">
                      <div className="ainbox-pdf-icon-box">
                        <span className="ainbox-pdf-icon" aria-hidden="true" />
                      </div>
                      <div className="ainbox-pdf-meta">
                        <div className="ainbox-pdf-name">{(threadMsg.attachment.name || '').replace(/\.pdf$/i, '')}</div>
                        <div className="ainbox-pdf-ext">PDF</div>
                      </div>
                      <div className="ainbox-pdf-menu">
                        <button className="ainbox-pdf-menu-btn" aria-label="Download">
                          <img src="/icons/mm-download.svg" alt="" width="16" height="16" />
                        </button>
                        <button className="ainbox-pdf-menu-btn" aria-label="Send">
                          <img src="/icons/mm-send-to.svg" alt="" width="16" height="16" />
                        </button>
                      </div>
                    </div>
                  )}
                  <Reactions reactions={threadMsg.reactions || THREAD_REACTIONS} />
                </div>
                {/* Replies — scroll under the pinned original */}
                <div className="ainbox-detail-messages ainbox-thread-messages" ref={messagesRef}>
                  {threadMsg.thread.replies.map(reply => (
                    <div key={reply.id} className="ainbox-group-msg">
                      {reply.isMM ? (
                        <div className="mm-thread-avatar-circle">
                          <img src="/icons/magic-quill.svg" alt="Magic Minutes" />
                        </div>
                      ) : (
                        <img className="ainbox-group-msg-avatar" src={reply.avatar} alt="" />
                      )}
                      <div className="ainbox-group-msg-body">
                        <div className="ainbox-group-msg-header">
                          <span className="ainbox-group-msg-name">{reply.sender}</span>
                        </div>
                        <p className="ainbox-group-msg-text">
                          {reply.isMention
                            ? reply.text.split(/(@MagicMinutes)/g).map((p, i) =>
                                p === '@MagicMinutes'
                                  ? <span key={i} className="mm-mention">@MagicMinutes</span>
                                  : <span key={i}>{p}</span>
                              )
                            : reply.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}

          {/* ——— Group view ——— */}
          {!threadView && convo && (convo.type === 'group' || convo.type === 'meeting') && (
            <>
              {/* Group header */}
              <div className="ainbox-detail-header">
                <div className="ainbox-detail-header-left">
                  {convo.type === 'meeting' ? (
                    <div className="ainbox-detail-header-meeting-icon">
                      <img src={convo.groupImg} alt="" className="ainbox-section-item-icon-img" />
                    </div>
                  ) : (
                    <img src={convo.groupImg || convo.avatars[0]} alt="" className="ainbox-detail-header-avatar" />
                  )}
                  <span className="ainbox-detail-header-name">{convo.name}</span>
                </div>
                <div className="ainbox-detail-header-right">
                  {/* Facepile */}
                  <div className="ainbox-facepile">
                    <div className="ainbox-facepile-faces">
                      {convo.avatars.slice(0, 3).map((src, i) => (
                        <img key={i} src={src} alt="" className="ainbox-facepile-img" />
                      ))}
                    </div>
                    <div className="ainbox-facepile-count">
                      <span>{convo.memberCount}</span>
                    </div>
                  </div>
                  <div className="ainbox-detail-header-actions">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="3" r="1" fill="currentColor"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="8" cy="13" r="1" fill="currentColor"/></svg>
                  </div>
                </div>
              </div>
              {/* Pinned toolbar */}
              {convo.pinnedItems && <PinnedToolbar items={convo.pinnedItems} />}
              {/* Meeting timeline */}
              {convo.timeline && <div className="ainbox-timeline-wrap ainbox-timeline-clickable" onClick={onOpenMagicMinutes}><MeetingTimeline timeline={convo.timeline} label="Open Timeline" /></div>}
              {/* Group messages */}
              <div className="ainbox-detail-messages ainbox-group-messages" ref={messagesRef}>
                {convo.messages.map(msg => (
                  <GroupMessage key={msg.id} msg={msg} onThreadClick={(m) => openThread(selectedChat, m.id)} />
                ))}
              </div>
            </>
          )}

          {/* ——— On-It view (DM chat + animated task pane) ——— */}
          {!threadView && convo && convo.type === 'onit' && (
            <>
              <div className="ainbox-detail-header">
                <div className="ainbox-detail-header-left">
                  <img src={convo.avatar} alt="" className="ainbox-detail-header-avatar" />
                  <span className="ainbox-detail-header-name">{convo.name}</span>
                  {convo.subtitle && <span className="ainbox-detail-header-subtitle">{convo.subtitle}</span>}
                </div>
                <div className="ainbox-detail-header-actions">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="3" r="1" fill="currentColor"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="8" cy="13" r="1" fill="currentColor"/></svg>
                </div>
              </div>
              <div className="ainbox-onit-split">
                <div className="ainbox-onit-chat">
                  <div className="ainbox-detail-messages ainbox-dm-messages" ref={messagesRef}>
                    {getDmGroups(convo.messages).map(msg => (
                      <DmMessage key={msg.id} msg={msg} isFirstInGroup={msg.isFirstInGroup} isLastInGroup={msg.isLastInGroup} />
                    ))}
                  </div>
                  {composerEl}
                </div>
                <div className="ainbox-onit-task">
                  <OnItTaskPane
                    summary={convo.taskSummary}
                    steps={convo.taskSteps}
                    tasks={convo.tasks}
                    agentName={convo.name}
                    agentAvatar={convo.avatar}
                  />
                </div>
              </div>
            </>
          )}

          {/* ——— DM view ——— */}
          {!threadView && convo && convo.type === 'dm' && (
            <>
              {/* DM header */}
              <div className="ainbox-detail-header">
                <div className="ainbox-detail-header-left">
                  <img src={convo.avatar} alt="" className="ainbox-detail-header-avatar" />
                  <span className="ainbox-detail-header-name">{convo.name}</span>
                  {convo.subtitle && <span className="ainbox-detail-header-subtitle">{convo.subtitle}</span>}
                </div>
                <div className="ainbox-detail-header-actions">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="3" r="1" fill="currentColor"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="8" cy="13" r="1" fill="currentColor"/></svg>
                </div>
              </div>
              {/* DM messages */}
              <div className="ainbox-detail-messages ainbox-dm-messages" ref={messagesRef}>
                {getDmGroups(convo.messages).map(msg => (
                  <DmMessage key={msg.id} msg={msg} isFirstInGroup={msg.isFirstInGroup} isLastInGroup={msg.isLastInGroup} />
                ))}
              </div>
            </>
          )}

          {/* Composer (skipped for onit view — rendered inline in chat column) */}
          {!isOnitView && composerEl}
          </>
          )}
        </div>
        );
        })()}
      </div>

      {searchActive && (
        <SearchOverlay
          query={searchQuery || 'messages tab'}
          activeTab={searchActiveTab}
          onChangeTab={setSearchActiveTab}
        />
      )}
    </div>
  );
}

function SearchClockIcon() {
  return <span className="ainbox-search-dropdown-icon ainbox-icon-clock" aria-hidden="true" />;
}

function SearchSettingsIcon() {
  return <span className="ainbox-search-dropdown-icon ainbox-icon-settings" aria-hidden="true" />;
}

const SEARCH_HIGHLIGHT_RE_CACHE = {};
function highlightText(text, query) {
  if (!query) return text;
  const tokens = query.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return text;
  const pattern = tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  let re = SEARCH_HIGHLIGHT_RE_CACHE[pattern];
  if (!re) {
    // match the full query first if multi-word, then fall back to individual words
    const full = tokens.length > 1 ? tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+') + '|' : '';
    re = new RegExp('(' + full + pattern + ')', 'gi');
    SEARCH_HIGHLIGHT_RE_CACHE[pattern] = re;
  }
  const parts = text.split(re);
  return parts.map((p, i) => {
    if (!p) return null;
    if (re.test(p)) {
      return <mark key={i} className="ainbox-search-mark">{p}</mark>;
    }
    return <span key={i}>{p}</span>;
  });
}

const SEARCH_RESULTS = [
  {
    id: 'r1',
    avatar: '/headshots/derek-cicerone.jpg',
    name: 'Derek Cicerone',
    date: 'June 15th',
    text: 'The messages tab, a crucial component of our production system, is currently experiencing technical difficulties, rendering it inoperable. This unexpected issue has disrupted the seamless communication flow within our platform, hindering users from accessing vital messages. Our engineering team is diligently working to identify and rectify the problem, aiming to restore the functionality of the messages tab and ensure uninterrupted productivity for our users.',
  },
  {
    id: 'r2',
    avatar: '/headshots/klas-leino.jpg',
    name: 'Klas Leino',
    date: 'June 12th',
    text: 'The reliability of the messages tab has been compromised, impacting the overall user experience. Users are unable to utilize the essential messaging functionality provided by the messages tab, causing inconvenience and hindering effective communication within our platform. Our team is working diligently to address this issue and restore the full functionality of the messages tab, ensuring a seamless and uninterrupted messaging experience for all users.',
  },
  {
    id: 'r3',
    avatar: '/headshots/will-hou.jpg',
    name: 'Will Houseberry',
    date: 'June 9th',
    text: 'The messages tab is malfunctioning, impeding user communication. We are actively addressing the issue to restore its functionality swiftly, ensuring seamless messaging for all.',
  },
  {
    id: 'r4',
    avatar: '/headshots/michael-miller.jpg',
    name: 'Michael Miller',
    date: 'June 7th',
    text: '...unexpected issue with the messages tab has disrupted the seamless communication flow within our platform, hindering users from accessing vital messages.',
    attachment: { name: 'messages tab.png', sharedBy: 'Michael Miller', thumb: '/groups/Group Bug Report.png' },
  },
];

const SEARCH_TABS = [
  { id: 'messages', label: 'Messages' },
  { id: 'dms', label: 'DMs', count: 0 },
  { id: 'groups', label: 'Groups', count: 11 },
  { id: 'meetings', label: 'Meetings', count: 4 },
];

const SEARCH_CHIPS = [
  { label: 'Unread' },
  { label: 'From', dropdown: true },
  { label: 'In Group', dropdown: true },
  { label: 'Date', dropdown: true },
  { label: 'Has Attachment' },
  { label: 'Mentioned' },
  { label: 'Most Relevant', dropdown: true },
];

function ChipChevron() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchOverlay({ query, activeTab, onChangeTab }) {
  return (
    <div className="ainbox-search-overlay">
      {/* Tabs */}
      <div className="ainbox-search-tabs">
        {SEARCH_TABS.map(t => (
          <button
            key={t.id}
            className={`ainbox-search-tab ${activeTab === t.id ? 'ainbox-search-tab-active' : ''}`}
            onClick={() => onChangeTab(t.id)}
          >
            <span>{t.label}</span>
            {typeof t.count === 'number' && <span className="ainbox-search-tab-count">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Filter chips */}
      <div className="ainbox-search-chips">
        {SEARCH_CHIPS.map(chip => (
          <div key={chip.label} className={`ainbox-search-chip ${chip.plain ? 'ainbox-search-chip-plain' : ''}`}>
            {chip.icon === 'settings' && <span className="ainbox-search-chip-icon ainbox-icon-settings" aria-hidden="true" />}
            <span>{chip.label}</span>
            {chip.dropdown && <ChipChevron />}
          </div>
        ))}
      </div>

      {/* Results header */}
      <div className="ainbox-search-results-header">
        <span>Results From All</span>
        <ChipChevron />
      </div>

      {/* Results list */}
      <div className="ainbox-search-results-list">
        {SEARCH_RESULTS.map(r => (
          <div key={r.id} className="ainbox-search-result">
            <div className="ainbox-search-result-row">
              <img src={r.avatar} alt="" className="ainbox-search-result-avatar" />
              <div className="ainbox-search-result-labels">
                <span className="ainbox-search-result-date">{r.date}</span>
                <span className="ainbox-search-result-name">{r.name}</span>
              </div>
            </div>
            <p className="ainbox-search-result-text">{highlightText(r.text, query)}</p>
            {r.attachment && (
              <div className="ainbox-search-result-attachment">
                <img src={r.attachment.thumb} alt="" className="ainbox-search-result-attachment-thumb" />
                <div className="ainbox-search-result-attachment-meta">
                  <span className="ainbox-search-result-attachment-name">{highlightText(r.attachment.name, query)}</span>
                  <span className="ainbox-search-result-attachment-by">Shared by {r.attachment.sharedBy}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}

function ToolbarIcon({ d, title }) {
  return (
    <div className="ainbox-toolbar-icon" title={title}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d={d} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
