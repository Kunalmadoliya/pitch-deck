"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDeckApi,
  deckKeys,
  deleteDeckApi,
  fetchDeck,
  fetchDecks,
  isDeckBusy,
  isDeckWorking,
  type DeckDetail,
  type DeckSummary,
} from "@/lib/api/decks";

const POLL_MS = 2500;

/** All of the user's decks. Polls while any deck is still being generated. */
export function useDecks() {
  return useQuery<DeckSummary[], Error>({
    queryKey: deckKeys.list(),
    queryFn: fetchDecks,
    refetchInterval: (query) =>
      query.state.data?.some((d) => isDeckBusy(d.status)) ? POLL_MS : false,
  });
}

/** One deck with slides. Polls until the text and every slide image are done. */
export function useDeck(id: string) {
  return useQuery<DeckDetail, Error>({
    queryKey: deckKeys.detail(id),
    queryFn: () => fetchDeck(id),
    refetchInterval: (query) => {
      const deck = query.state.data;
      return !deck || isDeckWorking(deck) ? POLL_MS : false;
    },
  });
}

export function useCreateDeck() {
  const queryClient = useQueryClient();
  return useMutation<{ deckId: string }, Error, string>({
    mutationFn: createDeckApi,
    onSettled: () => queryClient.invalidateQueries({ queryKey: deckKeys.list() }),
  });
}

export function useDeleteDeck() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string, { previous?: DeckSummary[] }>({
    mutationFn: deleteDeckApi,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: deckKeys.list() });
      const previous = queryClient.getQueryData<DeckSummary[]>(deckKeys.list());
      if (previous) {
        queryClient.setQueryData<DeckSummary[]>(deckKeys.list(), previous.filter((d) => d.id !== id));
      }
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(deckKeys.list(), context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: deckKeys.all }),
  });
}
