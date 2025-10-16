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

export function useAuthState() {
	const client = getConvexClient();
	let userId = $state<string | null>(null);
	let isLoading = $state(true);

	$effect(() => {
		const checkAuth = async () => {
			try {
				const id = await client.query('auth:getUserId' as any, {});
				userId = id;
			} catch (e) {
				userId = null;
			} finally {
				isLoading = false;
			}
		};

		checkAuth();

		// Re-check periodically
		const interval = setInterval(checkAuth, 5000);
		return () => clearInterval(interval);
	});

	return {
		get userId() {
			return userId;
		},
		get isLoading() {
			return isLoading;
		},
		get isAuthenticated() {
			return !!userId;
		}
	};
}

export function useAuthActions() {
	const client = getConvexClient();

	return {
		signIn: (args: any) => client.action('auth:signIn' as any, args),
		signOut: () => client.action('auth:signOut' as any, {}),
	};
}
