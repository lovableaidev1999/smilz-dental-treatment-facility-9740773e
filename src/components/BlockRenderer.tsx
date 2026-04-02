import type { JSONContent } from "@tiptap/core";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Props {
  content: JSONContent;
  className?: string;
}

const renderNode = (node: JSONContent, index: number): React.ReactNode => {
  if (!node) return null;

  const key = `${node.type}-${index}`;
  const children = node.content?.map((child, i) => renderNode(child, i));

  switch (node.type) {
    case "doc":
      return <>{children}</>;

    case "paragraph":
      return <p key={key} className="text-muted-foreground mb-4 leading-relaxed">{children}</p>;

    case "heading": {
      const level = node.attrs?.level || 2;
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      const sizes: Record<number, string> = {
        1: "text-3xl md:text-4xl font-bold mb-6",
        2: "text-2xl md:text-3xl font-bold mb-4",
        3: "text-xl md:text-2xl font-semibold mb-3",
      };
      return <Tag key={key} className={`font-heading text-foreground ${sizes[level] || sizes[2]}`}>{children}</Tag>;
    }

    case "text": {
      let el: React.ReactNode = node.text || "";
      node.marks?.forEach((mark) => {
        switch (mark.type) {
          case "bold":
            el = <strong className="font-semibold text-foreground">{el}</strong>;
            break;
          case "italic":
            el = <em>{el}</em>;
            break;
          case "strike":
            el = <s>{el}</s>;
            break;
          case "link":
            el = (
              <a
                href={mark.attrs?.href}
                target={mark.attrs?.target || "_blank"}
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                {el}
              </a>
            );
            break;
        }
      });
      return <span key={key}>{el}</span>;
    }

    case "bulletList":
      return <ul key={key} className="list-disc pl-6 mb-4 space-y-1 text-muted-foreground">{children}</ul>;

    case "orderedList":
      return <ol key={key} className="list-decimal pl-6 mb-4 space-y-1 text-muted-foreground">{children}</ol>;

    case "listItem":
      return <li key={key}>{children}</li>;

    case "blockquote":
      return (
        <blockquote key={key} className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground">
          {children}
        </blockquote>
      );

    case "horizontalRule":
      return <hr key={key} className="my-8 border-border" />;

    case "hardBreak":
      return <br key={key} />;

    // ─── Custom Dental Blocks ────────────────────────────

    case "mediaBlock": {
      const { src, alt, caption } = node.attrs || {};
      if (!src) return null;
      return (
        <figure key={key} className="my-6">
          <img
            src={src}
            alt={alt || "Dental care image"}
            className="w-full rounded-2xl shadow-card"
            loading="lazy"
          />
          {caption && (
            <figcaption className="text-sm text-muted-foreground text-center mt-2 italic">
              {caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case "ctaBlock": {
      const { text, url, style } = node.attrs || {};
      const isGold = style === "gold";
      return (
        <div key={key} className="my-8 flex justify-center">
          <Link
            to={url || "/contact"}
            className={`inline-block px-8 py-3.5 rounded-lg font-semibold text-sm transition-all hover:shadow-elevated ${
              isGold
                ? "bg-[hsl(var(--dental-gold))] text-foreground hover:opacity-90"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {text || "Book Appointment"}
          </Link>
        </div>
      );
    }

    case "faqBlock": {
      const items = node.attrs?.items || [];
      if (!items.length) return null;
      return (
        <div key={key} className="my-8">
          <Accordion type="single" collapsible className="w-full">
            {items.map((item: { question: string; answer: string }, i: number) => (
              <AccordionItem key={i} value={`faq-${index}-${i}`}>
                <AccordionTrigger className="text-foreground font-medium text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* FAQ Schema markup for SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: items
                  .filter((it: { question: string; answer: string }) => it.question && it.answer)
                  .map((it: { question: string; answer: string }) => ({
                    "@type": "Question",
                    name: it.question,
                    acceptedAnswer: { "@type": "Answer", text: it.answer },
                  })),
              }),
            }}
          />
        </div>
      );
    }

    default:
      return children ? <div key={key}>{children}</div> : null;
  }
};

const BlockRenderer = ({ content, className }: Props) => {
  return <div className={className}>{renderNode(content, 0)}</div>;
};

export default BlockRenderer;
