import { ConvexClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';

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

export function useQuery<T>(query: any, getArgs: () => any) {
	const client = getConvexClient();
	let data = $state<T | undefined>(undefined);
	let currentUnsubscribe: (() => void) | null = null;

	$effect(() => {
		// Call getArgs inside the effect to track reactivity
		const args = getArgs();
		const argsStr = JSON.stringify(args);
		console.log('[useQuery] Effect triggered with args:', args, 'stringified:', argsStr);

		// Skip subscription if args is 'skip'
		if (args === 'skip') {
			console.log('[useQuery] Skipping subscription');
			if (currentUnsubscribe) {
				currentUnsubscribe();
				currentUnsubscribe = null;
			}
			return;
		}

		// Clean up previous subscription
		if (currentUnsubscribe) {
			console.log('[useQuery] Cleaning up previous subscription');
			currentUnsubscribe();
			currentUnsubscribe = null;
		}

		// Create new subscription
		console.log('[useQuery] Creating new subscription');
		currentUnsubscribe = client.onUpdate(query, args, (newData: T) => {
			console.log('[useQuery] Query update received:', newData);
			data = newData;
		});

		return () => {
			console.log('[useQuery] Effect cleanup - unsubscribing');
			if (currentUnsubscribe) {
				currentUnsubscribe();
				currentUnsubscribe = null;
			}
		};
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

export function useAction(action: any) {
	const client = getConvexClient();

	return async (args: any) => {
		return await client.action(action, args);
	};
}

// Simple client-side auth helpers. This is minimal and intended for demo
// purposes only. For production, wire up a proper auth provider.
const USER_KEY = 'convex_user_id';

export async function login(email: string, password: string) {
	const client = getConvexClient();
	const anyApi: any = api as any;
	const id = await client.mutation(anyApi.auth.login, { email, password });
	if (id) {
		try {
			localStorage.setItem(USER_KEY, id.toString());
		} catch (e) {
			// ignore storage errors
		}
	}
	return id;
}

export async function register(email: string, password: string, name?: string) {
	const client = getConvexClient();
	const anyApi: any = api as any;
	const id = await client.mutation(anyApi.auth.register, { email, password, name });
	if (id) {
		try {
			localStorage.setItem(USER_KEY, id.toString());
		} catch (e) {
			// ignore
		}
	}
	return id;
}

export async function logout() {
	try {
		localStorage.removeItem(USER_KEY);
	} catch (e) {
		// ignore
	}
}

export async function getCurrentUser() {
	const client = getConvexClient();
	try {
		const idStr = localStorage.getItem(USER_KEY);
		if (!idStr) return null;
		// Convex ids are opaque; try to use as-is
		// The generated API expects an Id type; passing the string works at runtime.
	const anyApi: any = api as any;
	const user = await client.query(anyApi.auth.getUser, { id: idStr });
		return user;
	} catch (e) {
		return null;
	}
}

export { api };
