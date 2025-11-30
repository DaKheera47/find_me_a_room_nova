export interface ModuleWithGroups {
  moduleCode: string;
  moduleName: string;
  availableGroups: string[];
  selectedGroups: string[];
  isLoadingGroups: boolean;
}
