"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import { BANGLA_FONTS, generateAndDownloadPDF } from "@/utils/pdf";
import PDFDocument from "@/components/PDFDocument";

// Dynamic import for SimpleMDE to avoid SSR issues
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

// Default markdown content
const DEFAULT_MARKDOWN = `# বাংলা মার্কডাউন থেকে পিডিএফ জেনারেটর

এটি একটি সম্পূর্ণ **বাংলা যুক্তাক্ষর** সাপোর্টসহ মার্কডাউন থেকে পিডিএফ জেনারেটর।

## সাধারণ যুক্তাক্ষর

ক্ষ ক্ত ক্ব ক্ম ক্র ক্ল ক্স ঙ্ক ঙ্খ ঙ্গ ঙ্ঘ চ্চ চ্ছ চ্ঞ জ্জ জ্ঞ জ্ব জ্র ঞ্চ ঞ্ছ ঞ্জ ঞ্ঝ ট্ট ট্ব ট্ম ট্র ড্ড ড্ব ড্র ড্ম ঢ্র ণ্ট ণ্ঠ ণ্ড ণ্ঢ ণ্ণ ণ্ব ণ্ম ত্ত ত্থ ত্ন ত্ব ত্ম ত্র থ্র দ্দ দ্ধ দ্ব দ্ভ দ্ম দ্র ধ্ব ধ্ম ধ্র ন্ট ন্ঠ ন্ড ন্ঢ ন্ত ন্থ ন্দ ন্ধ ন্ন ন্ব ন্ম প্ট প্ত প্ন প্প প্ল প্স ফ্র ফ্ল ব্জ ব্দ ব্ধ ব্ব ব্র ব্ল ভ্র ভ্ল ম্ন ম্প ম্ফ ম্ব ম্ভ ম্ম ম্ল য্য র্ক র্খ র্গ র্ঘ র্চ র্ছ র্জ র্ঝ র্ণ র্ত র্থ র্দ র্ধ র্ন র্প র্ফ র্ব র্ভ র্ম র্য র্ল র্শ র্ষ র্স র্হ ল্ক ল্গ ল্ট ল্ড ল্প ল্ফ ল্ব ল্ভ ল্ম ল্ল শ্চ শ্ছ শ্ন শ্ব শ্ম শ্র শ্ল ষ্ক ষ্ট ষ্ঠ ষ্ণ ষ্প ষ্ফ ষ্ব ষ্ম স্ক স্ট স্ত স্থ স্ন স্প স্ফ স্ব স্ম স্র স্ল হ্ণ হ্ন হ্ব হ্ম হ্র হ্ল

## যুক্তাক্ষরযুক্ত শব্দের উদাহরণ

### ক-যুক্ত
**ক্ষ:** ক্ষমা, পক্ষ, শিক্ষা, রক্ষা, লক্ষ্য, পরীক্ষা, ভক্ষণ, দক্ষ
**ক্ত:** রক্ত, যুক্ত, মুক্ত, শক্ত, ভক্ত, সংযুক্ত
**ক্র:** চক্র, শুক্র, ক্রম, ক্রয়, পক্রিয়া, ক্রোধ, ক্রীড়া
**ক্ব:** পক্ব, ক্বচিৎ
**ক্ম:** রুক্ম, রুক্মিণী
**ক্ল:** ক্লান্ত, ক্লাস, ক্লিক, ক্লিয়ার
**ক্স:** বাক্স, ট্যাক্স, ফ্যাক্স

### গ-যুক্ত
**ঙ্ক:** অঙ্ক, শঙ্কা, ব্যাংক, লঙ্কা, ঙ্কার, টাঙ্ক
**ঙ্খ:** শঙ্খ, শাঁখ
**ঙ্গ:** অঙ্গ, ভাঙ্গা, গাঙ্গেয়, সঙ্গ, বঙ্গ, রঙ্গ, মঙ্গল
**ঙ্ঘ:** সংঘ, ঘন্টা
**গ্ন:** অগ্নি, রাগ্নি
**গ্ধ:** মুগ্ধ, দগ্ধ, বিগ্ধ
**গ্র:** গ্রাম, গ্রন্থ, গ্রহ, আগ্রহ, উগ্র, তীব্রগ্রাহী

### চ-যুক্ত
**চ্চ:** উচ্চ, বাচ্চা, স্বচ্ছ, কচ্ছপ
**চ্ছ:** ইচ্ছা, আচ্ছা, গচ্ছিত, বচ্ছর
**চ্ঞ:** যাচ্ঞা, পঞ্চম
**চ্ব:** চ্বী
**জ্জ:** বিপজ্জনক, সজ্জা, তেজস্বী, রজ্জু
**জ্ঞ:** জ্ঞান, বিজ্ঞান, যজ্ঞ, বিজ্ঞাপন, জ্ঞানী, সংজ্ঞা
**জ্ব:** জ্বর, জ্বলা, জ্বালা, জ্বীবন
**জ্র:** বজ্র, অজ্র

### ট-যুক্ত
**ট্ট:** চট্টগ্রাম, ঘট্ট, পাট্টা, কুট্টি, লাট্টু
**ট্ব:** খট্বা
**ট্র:** রাষ্ট্র, ট্রেন, মাত্রা, ট্রাক, ইলেক্ট্রিক
**ড্ড:** আড্ডা, গড্ডল, বড়দিন
**ড্র:** ড্রাম, ড্রেস, সিন্ড্রোম

### ণ-যুক্ত
**ণ্ড:** গণ্ডি, কণ্ড, প্রচণ্ড, খণ্ড, ষাণ্ড
**ণ্ঠ:** কণ্ঠ, লুণ্ঠন, ঘণ্টা
**ণ্ণ:** বিষণ্ণ, রাণ্না
**ণ্ব:** বাণ্বীয়

### ত-যুক্ত
**ত্ত:** উত্তর, সত্তা, উত্তম, তত্ত্ব, বৃত্তি, সত্ত্বেও
**ত্থ:** অশ্বত্থ, তত্থাপি
**ত্ন:** রত্ন, যত্ন, প্রত্নতত্ত্ব
**ত্ব:** তত্ব, রাজত্ব, সত্বর, দাসত্ব
**ত্ম:** আত্মা, মহাত্মা
**ত্র:** পত্র, ত্রাণ, মাত্রা, ত্রিকোণ, নাত্রিণী, সুপাত্র, নক্ষত্র
**থ্র:** থ্রি, থ্রেড

### দ-যুক্ত
**দ্দ:** উদ্দেশ্য, বিদ্দ, উদ্দীপনা, মুদ্দা, বদ্দাস্ত
**দ্ধ:** উদ্ধার, বুদ্ধ, সিদ্ধান্ত, মুদ্ধ, দ্ধি
**দ্ব:** বিদ্বান, বিদ্বেষ, দ্বার, দ্বীপ, দ্বিতীয়
**দ্ভ:** উদ্ভব, উদ্ভিদ, লোভ্য
**দ্ম:** পদ্ম, পদ্মা, উদ্ম
**দ্র:** রুদ্র, ভদ্র, মুদ্রা, সুন্দর, দ্রব্য, দ্রুত, দ্রাবিড়
**ধ্ব:** ধ্বনি, ধ্বংস, ধ্বজা
**ধ্র:** ধ্রুব, মেধ্রা
**ধ্ম:** ধ্ম্র

### ন-যুক্ত
**ন্ট:** প্যান্ট, প্রিন্ট, কারেন্ট, ব্যাংক, ক্যান্টিন
**ন্ঠ:** কণ্ঠ, গ্রন্থ, বৃন্ত
**ন্ড:** গুন্ডা, ফান্ড, লন্ডন, বন্ড, ঝুন্ডা
**ন্ত:** শান্ত, অন্ত, জান্তা, দান্ত, ন্ত্রণ, অন্তর্গত
**ন্থ:** গ্রন্থ, অন্থা, সংবাদপন্থা
**ন্দ:** আনন্দ, বন্দর, ছন্দ, দুর্দান্ত, বন্দনা, শরীরন্দ
**ন্ধ:** অন্ধ, বন্ধ, গন্ধ, বন্ধু, যন্ধ্যা
**ন্ন:** নবান্ন, অন্ন, প্রবীণ, নতুন্না
**ন্ব:** অন্বেষণ, ধন্বন্তরি
**ন্ম:** জন্ম, চিন্ময়, চিন্মণি

### প-যুক্ত
**প্ট:** অপ্টিক, ক্যাপ্টেন, সেপ্টেম্বর
**প্ত:** সপ্তাহ, গুপ্ত, সুপ্ত, স্বপ্ন, প্রাপ্ত, স্বীকৃপ্ত
**প্ন:** স্বপ্ন, শুপ্নি
**প্প:** পাপ্পি, চাপ্পা
**প্ল:** প্লাস, প্ল্যাটফর্ম
**প্স:** প্সিকোলজি, ক্যাপ্স

### ব-যুক্ত
**ব্জ:** বিবজিত, ব্জবজে
**ব্দ:** শব্দ, অব্দ, বিহ্বল, সব্দেশ
**ব্ধ:** লব্ধ, বিব্ধ, সাব্ধান
**ব্ব:** দব্ব, রব্বানী
**ব্র:** ব্রাহ্মণ, ব্রজ, ব্রত, ব্রাশ
**ব্ল:** ব্লক, ব্ল্যাক, ব্লগ
**ভ্র:** ভ্রম, ভ্রমণ, ভ্রাতা, ভ্রূ
**ভ্ল:** ভ্লাদিমির

### ম-যুক্ত
**ম্ন:** নিম্ন, সম্নীত, নম্নীয়
**ম্প:** কম্প, লম্পট, সম্পর্ক, সম্পদ, কম্পিউটার
**ম্ফ:** কম্ফার্ট
**ম্ব:** অম্বর, শাম্বু, স্তম্ভ, কম্বল, লম্বা
**ম্ভ:** সম্ভব, প্রতিবিম্ব
**ম্ম:** সম্মান, সম্মত, উম্মু
**ম্ল:** ম্লান, আম্লান
**ম্র:** অম্র, ম্রক্ষা

### র-ফলা যুক্তাক্ষর
**ক্র:** ক্রম, ক্রয়
**গ্র:** গ্রাম, গ্রহণ
**ত্র:** মন্ত্র, ত্রাণ
**দ্র:** রুদ্র, ভদ্র
**প্র:** প্রকাশ, প্রবাদ, প্রেম, প্রিয়, প্রসাদ
**ব্র:** ব্রাহ্মণ, ব্রজ
**ভ্র:** ভ্রমণ, ভ্রম
**শ্র:** শ্রম, শ্রী, শ্রাবণ, শ্রেষ্ঠ, শ্রদ্ধা

### ল-যুক্ত
**ল্ক:** পল্কি, ফল্ক, বিল্কুল
**ল্প:** কল্প, কল্পনা, বিকল্প, সংকল্প, সল্প
**ল্ফ:** গল্ফ
**ল্ব:** বিল্ব, অল্বান
**ল্ম:** গুল্ম, বিল্ম
**ল্ল:** দোল্লা, বিল্লী, বুল্লি, বল্লভ

### শ-যুক্ত
**শ্চ:** পশ্চিম, পুরুশ্চরণ
**শ্ছ:** শুশ্ছা, শিশ্ছেদ
**শ্ন:** প্রশ্ন, শাশ্বত
**শ্ব:** বিশ্ব, বিশ্বাস, শ্বশুর, শ্বাস
**শ্ম:** সৌশ্ম্য
**শ্র:** শ্রম, শ্রেণী, শ্রাবণ
**শ্ল:** শ্লোক

### ষ-যুক্ত
**ষ্ক:** শুষ্ক, পুষ্ক
**ষ্ট:** কষ্ট, স্পষ্ট, দুষ্ট, নষ্ট, বৃষ্টি, সৃষ্টি
**ষ্ঠ:** সুষ্ঠু, শ্রেষ্ঠ, কণ্ঠ
**ষ্ণ:** কৃষ্ণ, তৃষ্ণা, উষ্ণ, তিরষ্ণা
**ষ্প:** নিষ্পাপ, নিষ্পত্তি
**ষ্ফ:** স্ফুলিঙ্গ, নিষ্ফল
**ষ্ম:** রশ্মি, উষ্ম

### স-যুক্ত
**স্ক:** স্কুল, স্কেল, মাস্ক
**স্ট:** স্টেশন, স্টুডিও, পোস্ট
**স্ত:** স্তব, স্তর, স্তম্ভ, বস্তু, অস্ত্র, ব্যস্ত, সংস্কৃতি
**স্থ:** স্থান, স্থির, স্থাপনা, স্থায়ী, স্বস্থ্য
**স্ন:** স্নান, স্নিগ্ধ, স্নেহ
**স্প:** স্পর্শ, স্পষ্ট, স্পন্দন
**স্ফ:** স্ফূর্তি, স্ফুলিঙ্গ
**স্ব:** স্বপ্ন, স্বর, স্বাধীনতা, স্বাস্থ্য, স্বাগত
**স্ম:** স্মরণ, স্মৃতি, স্মার্ট
**স্র:** স্রোত, স্রষ্টা
**স্ল:** স্লোগান, স্লাইড

### হ-যুক্ত
**হ্ণ:** অপরাহ্ণ, চিহ্ণ, প্রতীহ্ণ
**হ্ন:** চিহ্ন, বহ্নি, বাহ্ন, জহ্নু
**হ্ব:** আহ্বান, বিহ্বল
**হ্ম:** ব্রহ্মা, ব্রাহ্মণ
**হ্র:** হৃদয়, হ্রস্ব, হ্রাস
**হ্ল:** আহ্লাদ

## বৈশিষ্ট্য

- 📝 **সম্পূর্ণ মার্কডাউন সাপোর্ট**
- 👁️ **লাইভ প্রিভিউ**
- 🔤 **১৪টি বাংলা ফন্ট**
- 📄 **ক্লায়েন্ট-সাইড পিডিএফ জেনারেশন**
- ⚡ **দ্রুত ডাউনলোড**

### ব্যবহারবিধি

1. বাম পাশে আপনার মার্কডাউন লিখুন
2. উপরে থেকে পছন্দের বাংলা ফন্ট নির্বাচন করুন
3. "Download as PDF" বাটনে ক্লিক করুন
4. পিডিএফ ফাইল ডাউনলোড হবে

---

**বিশেষ দ্রষ্টব্য:** সকল যুক্তাক্ষর সঠিকভাবে রেন্ডার করার জন্য উপযুক্ত ইউনিকোড ফন্ট ব্যবহার করুন।

\`\`\`javascript
// বাংলা কোড উদাহরণ
const শুভেচ্ছা = "প্রোগ্রামিং জগতে স্বাগতম!";
console.log(শুভেচ্ছা);

const যুক্তাক্ষর = ['ক্ষ', 'জ্ঞ', 'ত্র', 'দ্ধ', 'ব্র', 'ষ্ট'];
yuktakshar.forEach(akhor => {
  console.log(\`যুক্তাক্ষর: \${akhor}\`);
});
\`\`\`

*সর্বশেষ আপডেট: নভেম্বর ২০২৫*
`;

export default function Home() {
  const [markdown, setMarkdown] = useState<string>(DEFAULT_MARKDOWN);
  const [selectedFont, setSelectedFont] = useState<string>(
    BANGLA_FONTS[0].name
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Memoize SimpleMDE options
  const simpleMdeOptions = useMemo(() => {
    return {
      spellChecker: false,
      placeholder: "Write your markdown here...",
      status: false,
      toolbar: [
        "bold",
        "italic",
        "heading",
        "|",
        "quote",
        "unordered-list",
        "ordered-list",
        "|",
        "link",
        "image",
        "|",
        "preview",
        "side-by-side",
        "fullscreen",
        "|",
        "guide",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any,
    };
  }, []);

  // Handle PDF generation and download
  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);

      // Create PDF document with selected font
      const pdfDoc = (
        <PDFDocument content={markdown} fontFamily={selectedFont} />
      );

      // Generate and download
      await generateAndDownloadPDF(pdfDoc, "markdown-document.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(
        "Failed to generate PDF. Please ensure font files are in /public/fonts/"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-800">
              Markdown → PDF Generator
            </h1>
            <p className="text-sm text-slate-600">with Bangla Font Support</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Controls Section */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <label
              htmlFor="font-selector"
              className="text-sm font-medium text-slate-700"
            >
              Select Font:
            </label>
            <select
              id="font-selector"
              value={selectedFont}
              onChange={(e) => setSelectedFont(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {BANGLA_FONTS.map((font) => (
                <option key={font.name} value={font.name}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg
                  className="mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download as PDF
              </>
            )}
          </button>
        </div>

        {/* Editor and Preview Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Markdown Editor */}
          <div className="flex flex-col">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                Markdown Editor
              </h2>
            </div>
            <div className="flex-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <SimpleMDE
                value={markdown}
                onChange={setMarkdown}
                options={simpleMdeOptions}
              />
            </div>
          </div>

          {/* Preview Panel */}
          <div className="flex flex-col">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Preview</h2>
            </div>
            <div className="flex-1 overflow-auto rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="prose prose-slate max-w-none">
                <ReactMarkdown>{markdown}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-amber-900">
            📌 Important: Font Files Required
          </h3>
          <p className="text-sm text-amber-800">
            Place your Bangla font files (.ttf format) in the{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">
              /public/fonts/
            </code>{" "}
            directory. Font files should match the names configured in{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">
              src/utils/pdf.ts
            </code>
            . You can download free Bangla fonts from Google Fonts or other
            sources.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white/80 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-slate-600">
          Built with Next.js, TypeScript, React PDF, and Tailwind CSS
        </div>
      </footer>
    </div>
  );
}
