import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FlyerConfig } from "../types";
import { DesignControls } from "./DesignControls";
import { ContentControls } from "./ContentControls";
import { BrandingControls } from "./BrandingControls";
import { LayoutTemplate, Type, Palette, Check } from "lucide-react";

interface SidebarProps {
  config: FlyerConfig;
  updateConfig: (section: keyof FlyerConfig, key: string, value: any) => void;
  onExport?: (type: "png" | "pdf") => void;
  isExporting?: boolean;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  tips?: string[];
}

export function Sidebar({ config, updateConfig, tips }: SidebarProps) {
  return (
    <div className="w-full flex flex-col bg-white dark:bg-brand-void h-auto md:h-full">
      <div className="w-full md:flex-1 md:overflow-y-auto px-4 custom-scrollbar">
        <Accordion
          type="single"
          collapsible
          className="space-y-4 py-6"
        >
          <AccordionItem value="design" className="border-0">
            <AccordionTrigger className="hover:no-underline py-2 [&[data-state=closed]]:text-brand-copper group">
              <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-brand-copper/10 group-hover:text-brand-copper transition-colors">
                  <LayoutTemplate className="w-4 h-4" />
                </div>
                Diseño & Layout
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-6 px-1 max-h-[60vh] overflow-y-auto custom-scrollbar md:max-h-none md:overflow-visible">
              <DesignControls config={config} updateConfig={updateConfig} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="content" className="border-0">
            <AccordionTrigger className="hover:no-underline py-2 [&[data-state=closed]]:text-brand-copper group">
              <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-brand-copper/10 group-hover:text-brand-copper transition-colors">
                  <Type className="w-4 h-4" />
                </div>
                Contenido
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-6 px-1 max-h-[60vh] overflow-y-auto custom-scrollbar md:max-h-none md:overflow-visible">
              <ContentControls config={config} updateConfig={updateConfig} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="branding" className="border-0">
            <AccordionTrigger className="hover:no-underline py-2 [&[data-state=closed]]:text-brand-copper group">
              <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-brand-copper/10 group-hover:text-brand-copper transition-colors">
                  <Palette className="w-4 h-4" />
                </div>
                Branding
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-6 px-1 max-h-[60vh] overflow-y-auto custom-scrollbar md:max-h-none md:overflow-visible">
              <BrandingControls config={config} updateConfig={updateConfig} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Tips: siempre al fondo del sidebar, debajo de los accordions */}
        {tips && tips.length > 0 && (
          <div className="pb-6">
            <div className="rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 p-4 flex flex-col gap-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                A tener en cuenta
              </p>
              <ul className="flex flex-col gap-2.5">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 bg-brand-copper/10 dark:bg-brand-copper/20">
                      <Check className="w-2.5 h-2.5 text-brand-copper" />
                    </span>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400 leading-snug">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
