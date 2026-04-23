---
name: ui-beautiful-page
description: "Use when designing or refining a beautiful UI page, especially a long-form, immersive, motion-rich page in a Vue/Nuxt app. Helps with layout direction, section-by-section implementation, GSAP/ScrollTrigger motion, responsive cleanup, and visual quality checks."
argument-hint: "Design a beautiful page module by module"
user-invocable: true
disable-model-invocation: false
---

# UI Beautiful Page Design

Use this skill when building a polished, cinematic, or high-end UI page from an existing app or design reference.

## What This Skill Produces

- A clear visual direction before code is written
- A module-by-module implementation plan
- Strong hierarchy, pacing, and visual rhythm
- Scroll-based motion using GSAP and ScrollTrigger when appropriate
- Responsive behavior that degrades gracefully on mobile
- A final quality pass focused on overlap, blank states, and motion smoothness

## When to Use

- Designing landing pages, about pages, brand stories, or long-form storytelling pages
- Refactoring a static page into a more cinematic experience
- Adding staggered text reveals, pinned sections, parallax, or layered transitions
- Reviewing a page that feels flat, crowded, or mechanically animated

## Working Principles

1. Do not generate the whole page at once.
2. Start by analyzing the current structure and identifying the visual story.
3. Break the page into modules or chapters.
4. Implement one module at a time and validate before moving on.
5. Use motion to support structure, not to mask poor layout.
6. Prefer layered transitions, staggered text, and speed differences over uniform movement.

## Procedure

### 1. Analyze the page

- Identify the page goal, audience, and emotional tone.
- Check the current section order and whether it already has a narrative arc.
- Note where content overlaps, where scroll stalls, and where the page feels empty.
- Decide whether the page should be static, lightly animated, or cinematic.

### 2. Define the visual direction

- Choose one clear design language.
- Set the background treatment, typography mood, spacing rhythm, and image style.
- If the page is narrative, define the chapter sequence before adding motion.
- If needed, use mock images first to test the composition and motion timing.

### 3. Split into modules

- Hero or opening statement
- Story or mission section
- Feature or capability section
- Data or trust section
- Closing CTA

For each module, decide:

- What the visual anchor is
- What moves faster: text, background, or images
- Whether the section should pin, scrub, or simply fade in
- Whether the module should replace the previous one or sit after it in the document flow

### 4. Build the motion system

- Use GSAP timelines for coordinated sequences.
- Use ScrollTrigger for scroll-linked chapters.
- Use pin only when the section needs to hold the viewport for a narrative beat.
- Use stagger for line-by-line or item-by-item reveals.
- Use path drawing for lines, outlines, and decorative diagrams.
- Use parallax speed differences to create depth.

### 5. Validate each module

- Confirm the section enters and exits cleanly.
- Check that no section becomes blank during scrub.
- Make sure pinned sections do not hide the next module unexpectedly.
- Verify the hierarchy on desktop and mobile.
- Keep motion smooth and avoid overloading the page with too many heavy layers.

### 6. Final quality pass

- Check for overlapping content.
- Check for dead scroll areas or empty states.
- Ensure backgrounds are opaque enough when the next section appears.
- Verify reduced-motion behavior.
- Confirm cleanup on unmount or route change.

## Decision Rules

- If the page feels flat, add one strong narrative hook rather than many small effects.
- If the page feels crowded, remove motion before changing typography.
- If text and background move at the same speed, introduce speed separation.
- If sections collide, shorten the pin duration or add a transition spacer.
- If a module becomes hard to understand on mobile, simplify the motion and preserve the message.

## Completion Criteria

- The page has a clear visual story.
- Each module has one purpose.
- Motion feels intentional and supports readability.
- No obvious overlap, flicker, or blank scroll gaps remain.
- Mobile still feels polished, even if the motion is reduced.

## Good Prompts To Use With This Skill

- Design this about page as a cinematic scroll story.
- Refine this long page so the modules feel premium and immersive.
- Turn this static landing page into a layered GSAP narrative.
- Review this page for overlap, spacing, and motion polish.
