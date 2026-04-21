import React, { useState, useRef, useEffect } from 'react';
import { useChat, registerChatData } from './ChatContext';
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
        <p className="ainbox-group-msg-text">{msg.text}</p>
        {msg.thread && <ThreadIndicator thread={msg.thread} onClick={() => onThreadClick && onThreadClick(msg)} />}
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
const THREAD_REACTIONS = [
  { emoji: '👍', count: 1 }, { emoji: '😂', count: 3 },
  { emoji: '🤪', count: 5, active: true }, { emoji: '😡', count: 12 }, { emoji: '🚀', count: 4 },
];

export default function AInbox({ win, onDrag, onOpenMagicMinutes }) {
  const [selectedChat, setSelectedChat] = useState('design');
  const [collapsedSections, setCollapsedSections] = useState({});
  const [inputText, setInputText] = useState('');
  const { messages, setMessages, pickRandom, getReply } = useChat();
  const [closing, setClosing] = useState(false);
  // threadView: null or { chatId, messageId }
  const [threadView, setThreadView] = useState(null);
  const messagesRef = useRef(null);
  const composerInputRef = useRef(null);
  const shouldScroll = useRef(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => win.close(), 200);
  };

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

  // Continuous auto-chat across all group conversations
  useEffect(() => {
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
  }, []);

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
      className={`ainbox-window ${!win.isFocused ? 'ainbox-unfocused' : ''} ${closing ? 'ainbox-closing' : ''}`}
      style={{ left: win.position.x, top: win.position.y, zIndex: win.zIndex }}
      onMouseDown={() => { win.focus(); setTimeout(() => composerInputRef.current?.focus({ preventScroll: true }), 50); }}
    >
      {/* ——— Title bar ——— */}
      <div className="ainbox-titlebar" onMouseDown={onDrag}>
        <div className="ainbox-traffic-lights">
          <div className="ainbox-light ainbox-light-close" onClick={(e) => { e.stopPropagation(); handleClose(); }} />
          <div className="ainbox-light ainbox-light-minimize" />
          <div className="ainbox-light ainbox-light-maximize" />
        </div>
        <div className="ainbox-search">
          <img src="/icons/mm-search.svg" alt="" width="16" height="16" />
          <span>Search</span>
        </div>
      </div>

      {/* ——— Body ——— */}
      <div className="ainbox-body">

        {/* ——— Sidebar ——— */}
        <div className="ainbox-sidebar">
          {/* Sidebar header */}
          <div className="ainbox-sidebar-header">
            <div className="ainbox-sidebar-header-left">
              <span className="ainbox-sidebar-title">AInbox</span>
              <ChevronDown open={true} />
            </div>
            <img src="/icons/compose.svg" alt="" className="ainbox-compose-icon" />
          </div>

          {/* Scrollable sections */}
          <div className="ainbox-sections">
            {/* Favorites row */}
            <div className="ainbox-favorites">
              {FAVORITES.map(fav => (
                <div
                  key={fav.id}
                  className={`ainbox-fav-item ${selectedChat === fav.id ? 'ainbox-fav-active' : ''}`}
                  onClick={() => { setSelectedChat(fav.id); setThreadView(null); }}
                >
                  {fav.avatars ? (
                    <div className="ainbox-fav-group-avatar">
                      {fav.avatars.map((src, i) => (
                        <img key={i} src={src} alt="" className="ainbox-fav-group-img" style={{ zIndex: 2 - i }} />
                      ))}
                    </div>
                  ) : (
                    <img src={fav.avatar} alt="" className="ainbox-fav-avatar" />
                  )}
                  <span className="ainbox-fav-name">{fav.name}</span>
                </div>
              ))}
            </div>
            {SIDEBAR_SECTIONS.map(section => (
              <div key={section.id} className="ainbox-section">
                <div className="ainbox-section-header" onClick={() => toggleSection(section.id)}>
                  <ChevronDown open={!collapsedSections[section.id]} className="ainbox-section-chevron" />
                  <span className="ainbox-section-label">{section.label}</span>
                </div>
                {!collapsedSections[section.id] && (
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
                              <img src="/icons/magic-quill.svg" alt="" className="ainbox-section-item-icon-img" />
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
                )}
              </div>
            ))}
            {/* Add Folder */}
            <div className="ainbox-section-item ainbox-add-folder">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
              <span className="ainbox-section-item-name">Add Folder</span>
            </div>
          </div>
        </div>

        {/* ——— Detail pane ——— */}
        <div className="ainbox-detail">
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
                {/* Thread conversation */}
                <div className="ainbox-detail-messages ainbox-thread-messages" ref={messagesRef}>
                  {/* Original message */}
                  <div className="ainbox-thread-original">
                    <div className="ainbox-thread-original-top">
                      <img src={threadMsg.avatar} alt="" className="ainbox-group-msg-avatar" />
                      <div className="ainbox-thread-original-info">
                        <span className="ainbox-thread-original-name">{threadMsg.sender}</span>
                        <span className="ainbox-thread-original-time">{threadMsg.time}</span>
                      </div>
                    </div>
                    <p className="ainbox-thread-original-text">{threadMsg.text}</p>
                    <Reactions reactions={THREAD_REACTIONS} />
                  </div>
                  {/* Replies */}
                  {threadMsg.thread.replies.map(reply => (
                    <div key={reply.id} className="ainbox-group-msg">
                      <img className="ainbox-group-msg-avatar" src={reply.avatar} alt="" />
                      <div className="ainbox-group-msg-body">
                        <div className="ainbox-group-msg-header">
                          <span className="ainbox-group-msg-name">{reply.sender}</span>
                        </div>
                        <p className="ainbox-group-msg-text">{reply.text}</p>
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

          {/* Composer */}
          <div className="ainbox-composer">
            {convo?.typingAvatars && (
              <TypingIndicator avatars={convo.typingAvatars} />
            )}
            <div className="ainbox-composer-box">
              <div className="ainbox-composer-field">
                <input
                  ref={composerInputRef}
                  placeholder="Write a Message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                />
              </div>
              <div className="ainbox-composer-toolbar">
                {/* Plus button */}
                <div className="ainbox-toolbar-plus">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                {/* Formatting icons */}
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
                {/* Spacer */}
                <div className="ainbox-toolbar-spacer" />
                {/* Right icons */}
                <div className="ainbox-toolbar-group">
                  <img src="/icons/composer/Send.svg" alt="" className={`ainbox-toolbar-img ainbox-send-icon ${inputText.trim() ? 'ainbox-send-active' : ''}`} title="Send" onClick={sendMessage} />
                </div>
              </div>
            </div>
          </div>
        </div>
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
