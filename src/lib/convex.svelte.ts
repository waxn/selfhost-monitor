import { ConvexClient } from 'convex/browser';
import { getContext, setContext } from 'svelte';

const CONVEX_KEY = Symbol('convex');

export function initConvex(url: string) {
	const client = new ConvexClient(url);
	setContext(CONVEX_KEY, client);
	return client;
}

export function getConvexClient(): ConvexClient {
	return getContext(CONVEX_KEY);
}

export function useQuery<T>(query: any, args?: any) {
	const client = getConvexClient();
	let data = $state<T | undefined>(undefined);

	$effect(() => {
		const unsubscribe = client.onUpdate(query, args ?? {}, (newData: T) => {
			data = newData;
		});

		return () => unsubscribe();
	});

	return {
		get data() {
			return data;
		}
	};
}

export function useMutation(mutation: any) {
	const client = getConvexClient();

	return async (args: any) => {
		return await client.mutation(mutation, args);
	};
}
