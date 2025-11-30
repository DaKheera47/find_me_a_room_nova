"use client";

import { Trash2, Calendar, Link as LinkIcon } from "lucide-react";
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
import { ModuleWithGroups } from "./types";

interface SelectedModulesCardProps {
  selectedModules: ModuleWithGroups[];
  openAccordions: string[];
  setOpenAccordions: (value: string[]) => void;
  handleRemoveModule: (moduleCode: string) => void;
  handleToggleGroup: (moduleCode: string, group: string) => void;
  handleGenerateLink: () => void;
  hasValidSelections: boolean;
  isGeneratingLink: boolean;
}

export function SelectedModulesCard({
  selectedModules,
  openAccordions,
  setOpenAccordions,
  handleRemoveModule,
  handleToggleGroup,
  handleGenerateLink,
  hasValidSelections,
  isGeneratingLink,
}: SelectedModulesCardProps) {
  if (selectedModules.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="size-5" />
          Selected Modules ({selectedModules.length})
        </CardTitle>
        <CardDescription>
          Choose which groups/session types to include for each module. Click to
          expand and configure.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion
          type="multiple"
          className="w-full"
          value={openAccordions}
          onValueChange={setOpenAccordions}
        >
          {selectedModules.map((module) => (
            <AccordionItem key={module.moduleCode} value={module.moduleCode}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex flex-1 items-center justify-between pr-2">
                  <div className="text-left">
                    <span className="font-semibold">{module.moduleCode}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {cleanModuleName(module.moduleName)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!module.isLoadingGroups &&
                      module.availableGroups.length > 0 && (
                        <Badge variant="secondary">
                          {module.selectedGroups.length}/
                          {module.availableGroups.length}
                        </Badge>
                      )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveModule(module.moduleCode);
                      }}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
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
                              handleToggleGroup(module.moduleCode, group)
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
          ))}
        </Accordion>

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
