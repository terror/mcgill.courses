import type { Instructor } from '../lib/types';
import type { ReqNode } from './requirements';
import type { Schedule } from './schedule';

export type Course = {
  _id: string;
  title: string;
  credits: string;
  subject: string;
  code: string;
  url: string;
  department: string;
  faculty: string;
  terms: string[];
  description: string;
  instructors: Instructor[];
  prerequisitesText?: string;
  corequisitesText?: string;
  prerequisites: string[];
  corequisites: string[];
  logicalPrerequisites?: ReqNode;
  logicalCorequisites?: ReqNode;
  leadingTo: string[];
  restrictions: string;
  schedule: Schedule[];
};
