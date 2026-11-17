//here we are exporting the inngest client and the functions array so that we can use them in other parts of the application

import { inngest } from "./client";
import { indexDocument } from "./functions/indexing";

export { inngest };
export const functions = [indexDocument];