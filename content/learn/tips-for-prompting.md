---
title: Tips for prompting
description: How to write prompts that get a strong page on the first try and better edits after.
group: Prompting
order: 1
icon: lightbulb
---

The model is good at design. What it doesn't know is your product, your audience, and your taste. Good prompts fill in exactly those gaps.

## Say what the page is for

Start with three facts: what the product is, who it's for, and the one thing you want visitors to do.

Before:

```
Make a landing page for my app.
```

After:

```
Landing page for Tally, a habit tracker for remote teams. Audience: team leads at 10–50 person startups. Main action: "Start free trial". Tone: calm, confident, a little playful.
```

The second prompt gives the model enough to write real headlines, pick a fitting style, and decide what goes above the fold.

## List the sections in order

If you know the structure you want, say it. The model follows a sensible default outline otherwise, but yours wins.

```
Sections: sticky nav, hero with a product mockup, logo strip, 3 feature cards, a "how it works" section with 3 numbered steps, testimonials, pricing with 3 tiers, FAQ, closing CTA, footer.
```

## Describe the look with concrete words

Words like "modern", "clean", and "beautiful" don't steer much. Every page is supposed to be those things. Use specifics:

| Vague | Specific |
| --- | --- |
| modern | dark near-black background, one lime accent, large tight headlines |
| clean | lots of whitespace, thin 1px borders, no shadows |
| premium | serif headlines, muted stone palette, generous spacing |
| fun | rounded font, pastel colors, bouncy hover animations |

Or skip the description and pick a **Design System**. Its palette and type are treated as binding.

## Show, don't describe

A reference often beats a paragraph:

- `@` a template or component and say what to take from it.
- Attach a screenshot (up to 4 images) of a page you like.
- Use the **Prompt Builder** to pick layout, style, and motion visually.

## Give it your real content

If you have a headline, feature list, or pricing, paste it in. Otherwise the model invents realistic-sounding copy, names, and numbers that you'll need to replace later.

```
Headline: "Your team's habits, finally visible."
Features: daily check-ins in Slack, streaks per person, weekly team report.
Pricing: Free (up to 5 people), Team $8/user/month, Business (contact us).
```

## Refine in small steps

After the first draft, change one or two things per prompt. Name the section you mean.

Before:

```
Make it better and more professional, fix the colors, and add more stuff.
```

After:

```
In the features section, replace the icons with small product screenshots and make the cards two columns on desktop.
```

For precise edits, select the element in Design mode and choose **Edit this element with AI**. The change stays inside that element.

For tiny fixes (a word, a link, a color class), skip the prompt and edit by hand in Design mode.

## Let the tools write the first draft of your prompt

- **Enhance prompt** (the wand) turns a rough idea into a detailed brief right in the composer.
- The **Prompt Enhancer** page (`/resources/tools/prompt-enhancer`) does the same, with options for project type and output style, then **Use in Create**.
- **Skills** add rules you'd otherwise repeat every time, like accessibility or copywriting guidelines.

> Tip: Always read an enhanced prompt before sending it. Delete anything that doesn't match what you want.

## Common mistakes

- **Contradictions.** "Minimal and calm" plus "lots of animations everywhere" forces the model to guess.
- **Rewriting the whole prompt each turn.** The model already has the current page. Just describe the change.
- **Asking for a backend.** The result is a single HTML page. Things like working sign-in or saved form submissions need to be wired up separately.
- **Fighting the design system.** If a preset is selected, don't ask for a different palette or fonts in the same prompt.
- **Giving up on a model too soon.** If a result misses, restore the previous version and retry with a clearer prompt, or switch models and press **Retry with the selected model**.
