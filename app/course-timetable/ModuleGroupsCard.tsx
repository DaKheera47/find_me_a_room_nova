"use client";

import { Trash2, Calendar, Link as LinkIcon, Lock } from "lucide-react";
import { cleanModuleName } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ModuleWithGroups } from "./useCourseTimetable";

interface ModuleGroupsCardProps {
  compulsoryModules: ModuleWithGroups[];
  optionalModules: ModuleWithGroups[];
  openAccordions: string[];
  setOpenAccordions: (value: string[]) => void;
  handleToggleGroup: (
    moduleCode: string,
    group: string,
    isCompulsory: boolean,
  ) => void;
  handleRemoveOptionalModule: (moduleCode: string) => void;
  handleGenerateLink: () => void;
  hasValidSelections: boolean;
  isGeneratingLink: boolean;
}

export function ModuleGroupsCard({
  compulsoryModules,
  optionalModules,
  openAccordions,
  setOpenAccordions,
  handleToggleGroup,
  handleRemoveOptionalModule,
  handleGenerateLink,
  hasValidSelections,
  isGeneratingLink,
}: ModuleGroupsCardProps) {
  const allModules = [...compulsoryModules, ...optionalModules];

  if (allModules.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="size-5" />
          Step 4: Configure Groups ({allModules.length} modules)
        </CardTitle>
        <CardDescription>
          Choose which groups/session types to include for each module.
          Compulsory modules are marked with a lock icon.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Compulsory Modules */}
        {compulsoryModules.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-semibold">
              <Lock className="size-4" />
              Compulsory Modules
            </h4>
            <Accordion
              type="multiple"
              className="w-full"
              value={openAccordions}
              onValueChange={setOpenAccordions}
            >
              {compulsoryModules.map((mod) => (
                <ModuleAccordionItem
                  key={mod.moduleCode}
                  module={mod}
                  isCompulsory={true}
                  onToggleGroup={handleToggleGroup}
                />
              ))}
            </Accordion>
          </div>
        )}

        {/* Optional Modules */}
        {optionalModules.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Optional Modules</h4>
            <Accordion
              type="multiple"
              className="w-full"
              value={openAccordions}
              onValueChange={setOpenAccordions}
            >
              {optionalModules.map((mod) => (
                <ModuleAccordionItem
                  key={mod.moduleCode}
                  module={mod}
                  isCompulsory={false}
                  onToggleGroup={handleToggleGroup}
                  onRemove={handleRemoveOptionalModule}
                />
              ))}
            </Accordion>
          </div>
        )}

        <Separator className="my-4" />

        <div className="flex gap-3">
          <Button
            onClick={handleGenerateLink}
            disabled={!hasValidSelections || isGeneratingLink}
          >
            {isGeneratingLink ? (
              <>
                <LoadingSpinner />
                Generating Link...
              </>
            ) : (
              <>
                <LinkIcon className="mr-2 size-4" />
                Generate Calendar Link
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface ModuleAccordionItemProps {
  module: ModuleWithGroups;
  isCompulsory: boolean;
  onToggleGroup: (
    moduleCode: string,
    group: string,
    isCompulsory: boolean,
  ) => void;
  onRemove?: (moduleCode: string) => void;
}

function ModuleAccordionItem({
  module,
  isCompulsory,
  onToggleGroup,
  onRemove,
}: ModuleAccordionItemProps) {
  return (
    <AccordionItem value={module.moduleCode}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex flex-1 items-center justify-between pr-2">
          <div className="text-left">
            <span className="font-semibold">{module.moduleCode}</span>
            <span className="ml-2 text-sm text-muted-foreground">
              {cleanModuleName(module.moduleName)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isCompulsory && <Lock className="size-3 text-muted-foreground" />}
            {!module.isLoadingGroups && module.availableGroups.length > 0 && (
              <Badge variant="outline">
                {module.selectedGroups.length}/{module.availableGroups.length}
              </Badge>
            )}
            {!isCompulsory && onRemove && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(module.moduleCode);
                }}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-3 pt-2">
          {module.isLoadingGroups ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoadingSpinner />
              Loading groups...
            </div>
          ) : module.availableGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No specific groups found. All sessions will be included.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {module.availableGroups.map((group) => (
                <label
                  key={group}
                  className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 hover:bg-accent"
                >
                  <Checkbox
                    checked={module.selectedGroups.includes(group)}
                    onCheckedChange={() =>
                      onToggleGroup(module.moduleCode, group, isCompulsory)
                    }
                  />
                  <span className="text-sm">
                    {group.startsWith("/") ? group.slice(1) : group}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
