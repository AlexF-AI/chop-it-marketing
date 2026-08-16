# ChatGPT Meal Planning: What It Does Well, and Where It Falls Over

*By [Alex Fahey](/author/alex-fahey), founder of Chop it. Last updated 16 August 2026.*

ChatGPT is now the first thing a lot of people open when they cannot face deciding what to cook. It is genuinely good at that job, better than most of the apps built for it. It is also missing two things that any meal plan needs to survive contact with a real week, and nobody selling you a meal planning app is going to explain the difference honestly.

So: what ChatGPT does well in a kitchen, where it stops working, and how to get a usable week out of it without installing anything. If you decide at the end that you want an app after all, I compare the [main UK meal planning apps here](/blog/best-meal-planning-apps-uk-2026), including how they handle recipes that started life in a chat.

I build one of the tools in this space, so read the last section with that in mind. The first three sections work whether or not you ever touch my product.

## What ChatGPT is genuinely better at

**Cooking from what you already have.** Every meal planning app starts by asking what you want to eat. That is the wrong end of the problem on a Wednesday when the fridge contains half a cabbage, three eggs and some feta going soft. Type exactly that into ChatGPT and you get something plausible to cook in about four seconds. No app here comes close, because apps search a catalogue and a catalogue does not contain your fridge.

**Adapting a recipe on demand.** Ask for the same dinner without dairy. Ask for it cheaper. Ask for it in one pan because you cannot face washing up, or for a version a seven-year-old will eat. Filter menus in recipe apps handle maybe three of those. ChatGPT handles all of them and the ones you have not thought of yet, in the language you would use with a friend who cooks.

**Answering the question behind the question.** "What goes with lamb" gets you a useful answer. So does "I have people over on Saturday and one of them is vegetarian and I am not a confident cook." A search box cannot do anything with the second one.

**Scaling and converting without fuss.** American cup measurements into grams, four portions into six, a roast timed backwards from when you want to eat. ChatGPT usually handles this dull arithmetic quickly, although quantities and food-safety-critical timings are still worth checking.

The free tier does all of the above. You do not need a subscription for meal planning, whatever anyone tells you.

## Where it stops working

**It does not reliably hold your week.** This is the big one. Plan five dinners on Sunday and by Wednesday that conversation is somewhere in your history, probably below three other chats. Memory can carry useful preferences across chats when it is enabled, but it is not a dependable record of the exact dinners and quantities you chose. There is no week view, nothing to tick off, and no way to see Thursday without scrolling.

**It does not hold a usable shopping list.** Ask for a combined list across five recipes and it will produce one, once. Then you remember you also need bin bags, and now you have a list in a chat window that you cannot tick items off in a shop with one hand while pushing a trolley. Add a sixth recipe on Tuesday and the original list does not update as structured data. It generates a new answer and you reconcile the two yourself.

**It does not maintain a pantry.** You can tell ChatGPT what is in your cupboards, but it does not keep a live stock record as ingredients are bought and used. Without that structure it will confidently put rice on your list every week. You own eleven bags of rice.

**Quantities drift when you combine recipes.** Four recipes each needing an onion should give you four onions on one line. ChatGPT usually gets this right when you ask directly and sometimes does not, particularly across a longer conversation. It has no structured record of what a recipe contains, so it is re-reading its own prose. This merging problem is exactly what [shopping list features in apps exist to solve](/blog/meal-planning-app-shopping-list-uk), and it is where the difference shows up most clearly.

**The recipe is buried in the chat history.** You cooked something excellent in March. Finding it again means remembering roughly when you asked and what words you used.

None of these are reasons to stop using it. They are reasons to use it deliberately.

## How to get a usable week out of ChatGPT with no app at all

This works on the free tier. It takes about ten minutes on a Sunday.

![Five-step method for making a weekly meal plan with ChatGPT](/blog/chatgpt-meal-planning/chatgpt-meal-planning-five-steps.webp)

**Set the constraints once, in one message.** Most people ask too vaguely and then spend six messages correcting. Front-load it:

> Plan 5 dinners for this week for 2 adults and a 6-year-old. Budget supermarket ingredients, nothing fancy. Two need to be ready in 25 minutes on weeknights. One should use up half a savoy cabbage and some feta. No fish, one vegetarian night. Give me the five titles first with a one-line description each, before any method.

Asking for titles first matters. You can reject two of the five before it writes 1,200 words you did not want.

**Approve, then ask for the method in a form you can use.** Once the five are right:

> Now give me the full method for each, in the order I will cook them. Metric quantities, UK ingredient names.

**Ask for the shopping list as a separate step, with explicit merging.** This is the instruction most people miss:

> Now a single shopping list for all five recipes combined. Merge duplicate ingredients into one line with the total quantity. Group by supermarket section: produce, meat and fish, dairy, dry goods, freezer. Put anything I probably already own in a separate list at the bottom.

That last sentence gets you a shorter list, because it separates the six items you actually need to buy from the salt and olive oil.

**Get it out of the chat.** This is the step that decides whether the plan survives. Copy the list into whatever you shop with, whether that is your phone's notes app or a shared list your partner can also edit. Copy the five titles into your calendar for the right days. The plan lives where you will look at it, and looking at it is the point.

**Start the next week in the same chat.** Say "same as last week but swap the chilli for something with the leftover chicken." Continuing a conversation keeps the constraints alive without retyping them.

Do those five things and ChatGPT is a perfectly good meal planner. The weakness is that step four is manual every single week, and manual steps are the ones people stop doing in February.

## Where Chop it fits

I built Chop it because that fourth step should not be a copy and paste job, and because a recipe worth cooking twice should not live in a chat log.

It runs [inside ChatGPT](https://chatgpt.com/plugins/plugin_asdk_app_6a1c0dfa60b88191b3360153a1c6613c), so the conversation above stays exactly as it is. You ask for a week the same way you already do. The difference is what happens to the answer: recipes become structured records with real ingredient quantities, so merging four onions into one line is arithmetic rather than the model re-reading its own paragraphs. The week persists as a week you can open on Thursday. The shopping list is a list you tick off in the shop.

The same library holds recipes that never came from a chat, which is most of them for most people: a photographed cookbook page, a website link, a video you saved. That is the part I care about most, because the scattering across sources is the actual problem and AI only added a new place to lose things.

What it does not do yet: signing in to your own account inside ChatGPT, so it can reach your existing library and pantry mid-conversation, is not live. Today the handoff into the iPhone app is explicit. There is no Android app.

If you never install it, use the five-step method above. It works, and it costs nothing. For a capability-by-capability breakdown of the split, see [Chop it vs ChatGPT: what each does better](/learn/chop-it-vs-chatgpt).

## Frequently asked questions

**Can ChatGPT create a weekly meal plan?**
Yes, and it is good at it. Give it your constraints in one message, ask for titles before methods, then ask separately for a merged shopping list grouped by supermarket section. The free tier is enough. The limitation is that the plan lives in a conversation, so you will need to move it somewhere you will actually look during the week.

**Is ChatGPT meal planning free?**
Yes. Everything described here works on the free tier. ChatGPT Go is £6.99 and Plus is £19.99 on the UK App Store, but neither is necessary for planning meals.

**Why does ChatGPT forget my meal plan?**
Each conversation is its own context, and a plan you made last Sunday is prose inside an older chat rather than a saved record. Memory can retain preferences like "no fish" but will not reliably hold the specifics of which five dinners you chose. Continue the same conversation week to week, or move the plan out into something built to keep it.

**Can ChatGPT make a shopping list from recipes?**
It can, and you should ask for it as a separate step after the recipes are settled. Tell it explicitly to merge duplicate ingredients into single lines with total quantities and to group by supermarket section. Without that instruction you tend to get the same ingredient repeated once per recipe.

**Is ChatGPT better than a meal planning app?**
For generating ideas and adapting recipes to your constraints, it is better than every app I have compared. For keeping a plan, a list and a recipe collection across weeks, a purpose-built app wins, because those need storage and structure rather than generation. Plenty of people sensibly use both.
