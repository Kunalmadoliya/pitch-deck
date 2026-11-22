import {inngest} from "../client";

export const generateDeck = inngest.createFunction(
  {id: "generate-deck", triggers: {event: "deck/generate-deck"}},
  async ({event, step}) => {
    const result = await step.run("handle-task", async () => {
      return {processed: true, id: event.data.id};
    });

    await step.sleep("pause", "1s");

    return {message: `Task ${event.data.id} complete`, result};
  },
);
