import { ConvexClient } from 'convex/browser';

let client: ConvexClient | null = null;

export function initConvex(url: string) {
	if (!client) {
		client = new ConvexClient(url);
	}
	return client;
}

export function getConvexClient() {
	if (!client) {
		throw new Error('Convex client not initialized. Call initConvex first.');
	}
	return client;
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
