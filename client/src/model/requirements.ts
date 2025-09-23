type Operator = 'AND' | 'OR';

type Group = {
  operator: Operator;
  groups: ReqNode[];
};

export type ReqNode = string | Group;

export type Requirements = {
  prereqs: string[];
  coreqs: string[];
  restrictions: string;
  prerequisitesText?: string;
  corequisitesText?: string;
};
