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
import { LayoutTemplate, Type, Palette } from "lucide-react";

interface SidebarProps {
  config: FlyerConfig;
  updateConfig: (section: keyof FlyerConfig, key: string, value: any) => void;
  onExport?: (type: "png" | "pdf") => void;
  isExporting?: boolean;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export function Sidebar({ config, updateConfig }: SidebarProps) {
  return (
    <div className="w-full flex flex-col bg-white dark:bg-brand-void h-auto md:h-full">
      <div className="w-full md:flex-1 md:overflow-y-auto px-4 custom-scrollbar">
        <Accordion
          type="single"
          collapsible
          defaultValue="design"
          className="space-y-4 py-6"
        >
          <AccordionItem value="design" className="border-0">
            <AccordionTrigger className="hover:no-underline py-2 [&[data-state=open]]:text-brand-copper group">
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
            <AccordionTrigger className="hover:no-underline py-2 [&[data-state=open]]:text-brand-copper group">
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
            <AccordionTrigger className="hover:no-underline py-2 [&[data-state=open]]:text-brand-copper group">
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
      </div>
    </div>
  );
}
