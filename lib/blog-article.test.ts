// Unit tests for the blog-article markdown parser.
//
// The parser lifts the hero title, byline, "Short answer" plate, contents
// and FAQ band out of a post's markdown. Getting it wrong is quiet: the
// block just doesn't render, or a chunk of body copy goes missing. These
// pin the conventions the real posts are written to.
//
// Run with `npm test`. Node's built-in runner strips the types at load, so
// there is no framework and no transform step.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { headingSlug, parseArticle } from '../app/lib/blogArticle.ts';

const SAMPLE = [
  '# How to Meal Plan for the Week (A System That Sticks)',
  '',
  '*By [Alex Fahey](/author/alex-fahey), founder of Chop it. Last updated 3 August 2026.*',
  '',
  '**Short answer:** pick a handful of dinners, write the one shopping list they need, and shop to it once.',
  '',
  'I have watched a lot of people try to build this habit.',
  '',
  '---',
  '',
  '## Quick answers',
  '',
  '- **How do I start?** Plan dinners only at first.',
  '- **How many meals?** Most households need 4–5 dinners a week.',
  '',
  '---',
  '',
  '## The method',
  '',
  'Body copy under the method heading.',
  '',
  '## Where people go wrong',
  '',
  'More body copy.',
].join('\n');

describe('parseArticle', () => {
  const parsed = parseArticle(SAMPLE);

  it('lifts the short answer, strips its label and capitalises it', () => {
    assert.equal(
      parsed.shortAnswer,
      'Pick a handful of dinners, write the one shopping list they need, and shop to it once.',
    );
  });

  it('drops the H1 and the byline from the body', () => {
    assert.ok(!parsed.body.includes('# How to Meal Plan'));
    assert.ok(!parsed.body.includes('*By [Alex Fahey]'));
  });

  it('keeps the body prose', () => {
    assert.ok(parsed.body.includes('I have watched a lot of people'));
    assert.ok(parsed.body.includes('Body copy under the method heading.'));
    assert.ok(parsed.body.includes('More body copy.'));
  });

  it('collects H2s as contents, excluding the FAQ heading', () => {
    assert.deepEqual(parsed.contents, [
      { id: 'the-method', text: 'The method' },
      { id: 'where-people-go-wrong', text: 'Where people go wrong' },
    ]);
  });

  it('parses the Quick answers list into FAQs and removes it from the body', () => {
    assert.equal(parsed.faqs.length, 2);
    assert.deepEqual(parsed.faqs[0], {
      question: 'How do I start?',
      answer: 'Plan dinners only at first.',
    });
    assert.ok(!parsed.body.includes('Quick answers'));
    assert.ok(!parsed.body.includes('How many meals?'));
  });

  it('derives a reading time of at least one minute', () => {
    assert.ok(parsed.readingMinutes >= 1);
    assert.equal(parseArticle('one word').readingMinutes, 1);
  });

  it('leaves a post without any furniture untouched', () => {
    const plain = parseArticle('Just a paragraph.\n\n## A heading\n\nMore.');
    assert.equal(plain.shortAnswer, null);
    assert.deepEqual(plain.faqs, []);
    assert.ok(plain.body.includes('Just a paragraph.'));
    assert.ok(plain.body.includes('## A heading'));
  });

  it('does not swallow a non-FAQ list under a Quick answers heading', () => {
    const odd = parseArticle(
      ['## Quick answers', '', 'A plain paragraph, not a list.', '', '## Next'].join('\n'),
    );
    assert.deepEqual(odd.faqs, []);
    assert.ok(odd.body.includes('A plain paragraph, not a list.'));
  });
});

describe('headingSlug', () => {
  it('matches the ids GitHub-flavoured markdown generates', () => {
    assert.equal(headingSlug('The method'), 'the-method');
    assert.equal(headingSlug('Where people go wrong'), 'where-people-go-wrong');
    assert.equal(headingSlug('Does it save money?'), 'does-it-save-money');
    assert.equal(headingSlug('30 plants a week'), '30-plants-a-week');
  });
});

// Guards the conventions against the real content: if a post stops matching
// them, the template silently loses a block, and this is what says so.
describe('the shipped posts', () => {
  const withShortAnswer = [
    'how-to-meal-plan-for-the-week',
    'how-to-eat-30-plants-a-week',
  ];

  for (const slug of withShortAnswer) {
    it(`${slug} still yields a short answer and contents`, () => {
      const md = readFileSync(
        join(process.cwd(), 'content', 'blog', `${slug}.md`),
        'utf8',
      );
      const parsed = parseArticle(md);
      assert.ok(
        parsed.shortAnswer && parsed.shortAnswer.length > 20,
        'expected a short answer paragraph',
      );
      assert.ok(parsed.contents.length >= 2, 'expected at least two H2s');
      assert.ok(parsed.body.length > 500, 'expected the body to survive parsing');
      assert.ok(
        !parsed.body.includes('**Short answer:**'),
        'short answer should be lifted out of the body',
      );
    });
  }
});
