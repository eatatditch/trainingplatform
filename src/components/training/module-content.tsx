import { BrandPurposeContent } from "./content/brand-purpose";
import { BrandEtiquetteContent } from "./content/brand-etiquette";
import { BrandUnhappyContent } from "./content/brand-unhappy";
import { ServerSOSContent } from "./content/server-sos";
import { ServerStationContent } from "./content/server-station";
import { ServerSuggestiveContent } from "./content/server-suggestive";
import { ServerCheckoutContent } from "./content/server-checkout";
import { MenuFoodContent } from "./content/menu-food";
import { MenuCocktailsContent } from "./content/menu-cocktails";
import { SafetyFoodContent } from "./content/safety-food";
import { SafetyStorageContent } from "./content/safety-storage";
import { AlcoholAwarenessContent } from "./content/alcohol-awareness";
import { OpeningDutiesContent } from "./content/opening-duties";
import { ClosingDutiesContent } from "./content/closing-duties";
import { SupportHostContent } from "./content/support-host";
import { SupportRunnerExpoContent } from "./content/support-runner-expo";
import { SupportBusserBarbackContent } from "./content/support-busser-barback";
import { BartenderOpsContent } from "./content/bartender-ops";

const MODULE_CONTENT: Record<string, React.ComponentType> = {
  "mod-brand-purpose": BrandPurposeContent,
  "mod-brand-etiquette": BrandEtiquetteContent,
  "mod-brand-unhappy": BrandUnhappyContent,
  "mod-srv-sos": ServerSOSContent,
  "mod-srv-station": ServerStationContent,
  "mod-srv-suggestive": ServerSuggestiveContent,
  "mod-srv-checkout": ServerCheckoutContent,
  "mod-menu-food": MenuFoodContent,
  "mod-menu-cocktails": MenuCocktailsContent,
  "mod-safety-food": SafetyFoodContent,
  "mod-safety-storage": SafetyStorageContent,
  "mod-alcohol": AlcoholAwarenessContent,
  "mod-ops-open": OpeningDutiesContent,
  "mod-ops-close": ClosingDutiesContent,
  "mod-sup-host": SupportHostContent,
  "mod-sup-runner": SupportRunnerExpoContent,
  "mod-sup-busser": SupportBusserBarbackContent,
  "mod-bar-ops": BartenderOpsContent,
};

export function ModuleContent({
  moduleId,
  fallbackHtml,
}: {
  moduleId: string;
  fallbackHtml?: string;
}) {
  const StructuredContent = MODULE_CONTENT[moduleId];

  if (StructuredContent) {
    return <StructuredContent />;
  }

  // Fallback to HTML renderer for unknown modules
  if (fallbackHtml) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: fallbackHtml }}
        />
      </div>
    );
  }

  return null;
}
