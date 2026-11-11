# Content: open questions for Alan

Content lives in `src/content/profile.ts`, `src/content/site.ts`, `src/data/links.ts`, and `src/data/projects.ts`. The resume is `public/resume.pdf`.

## Answered by Alan on November 10, 2026

- Email: show both `alanmozhoor@gmail.com` and `amozhoor7@gatech.edu`.
- X series: link the profile only for now.
- Ari AI: Alan is CTO. Link the demo. Contribution details come from his resume.
- Omen AI / ZeroDay Arena: removed from the site.
- Ascent: Alan is a founder. His resume lists "Ascent Math (joinascentmath.com), Co-Founder & Head of Engineering, May 2026 to present", which the site uses. The aerospace bio on `ascentskillz/ascentskillz` is not used.
- Robot arm project: do not link the team repository yet.
- vla-finetuning-scaling: keep on the site.
- Resume: supplied by Alan and added as `public/resume.pdf`, phone number included, as Alan confirmed. Experience entries for The Pert Group LLC and Georgia Southern University come from it.
- Degree: show "Mathematics and Computer Science", as Alan asked, not the resume's "Mathematics & Computing".
- Resume metrics for Ascent Math and The Pert Group are shown on the site, as Alan asked. They are self-reported on his resume.

## Answered by Alan on November 11, 2026

- Hero statement: keep option 1 from `docs/internal/copy-options.md`.
- Availability: keep "Open to research collaborations and robotics machine learning roles."
- Ari AI node count: keep "10-node" as written on the site.
- Ari AI HackATL event: no event label on the Ari AI card. HackATL stays in the case study text and the experience entry.

## Still open

- quantrl-fetch: the resume says QAT sweeps are in progress, but the README reports them done. The site follows the README.
- X series: add post or thread URLs when available.
- Robot arm project: add the repository link when Alan approves.
- LinkedIn: `https://www.linkedin.com/in/alan-mozhoor/`, from GitHub social accounts and the resume.
- Constellation: the AUC figures (0.73 baseline, 0.82 logistic regression) are not in the public README or `ml/README.md`. Its case study shows a status band instead of a key result until there is a public source to link.
- Robot arm project: no result exists yet, so its case study shows a status band. Add a key result when SGS against uniform resets has a held-out number Alan approves.

## Currently exploring (p10-exploring)

The Currently exploring section in `src/data/exploring.ts` has two threads: world action models, and agentic orchestration over learned policies. Both `readings` lists are empty on purpose, and the site shows no reading list until they have entries. Nothing was recalled or guessed.

- Readings: please send the papers you are reading for each thread. For each one, give the title, authors, year, a public URL, and a one-line note on why you are reading it (as a question or direction, not a result).
- Co-authors: before anything goes public, please confirm with your co-authors which of these threads, directions and readings may be shown on the site.
- Status for thread 2: it is set to "Reading" because your description did not name a status. Change it to "Looking for gaps" or "Sketching" if either fits better.
- Removed research interests not covered by the two threads, listed so you can restore any of them:
  - "Independent projects and public notes, not published research." (the section note)
  - RL: "Reinforcement learning for robotics. Goal-conditioned off-policy methods such as SAC with HER for manipulation, plus online RL post-training after imitation learning to win back performance lost to quantization or limited fine-tuning."
  - VLA: "Vision-language-action models. How pretrained VLA policies such as SmolVLA and pi0 adapt to new tasks from a few demonstrations, and which parts of the model to fine-tune or freeze."
  - Efficiency: "Efficient, hardware-aware policies. Quantization, smaller architectures and inference cost, judged by closed-loop behavior within the memory, latency and precision limits of microcontrollers and FPGAs." Thread 1's "Cut computational cost" direction covers part of this, not the microcontroller and FPGA detail.
