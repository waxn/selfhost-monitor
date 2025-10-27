<script lang="ts">
  import { goto } from '$app/navigation';
  export let error: Error | null = null;
  export let status: number | undefined;

  const goHome = () => goto('/');
  const tryAgain = () => history.length > 1 ? history.back() : goto('/');
</script>

<main class="error-page">
  <div class="card">
    <div class="illustration" aria-hidden>
      <!-- Cute robot/ghost SVG -->
      <svg width="220" height="160" viewBox="0 0 220 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="12" y="28" width="196" height="104" rx="18" fill="#0f1720" stroke="#24313a" stroke-width="2"/>
        <circle cx="70" cy="72" r="18" fill="#0b8" opacity="0.95"/>
        <circle cx="150" cy="72" r="18" fill="#38a1ff" opacity="0.95"/>
        <rect x="48" y="106" width="124" height="8" rx="4" fill="#24313a"/>
        <g transform="translate(40,18) scale(0.9)">
          <path d="M30 8 C48 -6 82 -6 100 8" stroke="#98a2a8" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.6"/>
        </g>
      </svg>
    </div>

    <div class="text">
      {#if status === 404}
        <h1>404 — Page Not Found</h1>
        <p>Looks like this page wandered off. Don’t worry — our tiny robot is looking for it.</p>
      {:else}
        <h1>Something went wrong</h1>
        <p>{error?.message ?? 'An unexpected error occurred.'}</p>
      {/if}

      <div class="actions">
        <button class="primary" on:click={goHome} aria-label="Go to homepage">Go home</button>
        <button class="ghost" on:click={tryAgain} aria-label="Go back or retry">Go back</button>
      </div>
    </div>
  </div>
</main>

<style>
  :global(html, body) { height: 100%; }
  .error-page {
    min-height: calc(100vh - 0px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 20px;
    background: linear-gradient(180deg, #071018 0%, #071216 100%);
    color: #e8eef2;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
  }

  .card {
    display: flex;
    align-items: center;
    gap: 28px;
    background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
    border: 1px solid rgba(255,255,255,0.04);
    padding: 28px;
    border-radius: 14px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.6);
    max-width: 900px;
    width: 100%;
  }

  .illustration { flex: 0 0 220px; display:flex; align-items:center; justify-content:center }

  h1 { margin: 0 0 8px 0; font-size: 28px; color: #fff }
  p { margin: 0 0 18px 0; color: #bfc9ce }

  .actions { display:flex; gap: 12px }

  button {
    border: none;
    padding: 10px 14px;
    font-size: 14px;
    border-radius: 10px;
    cursor: pointer;
  }

  .primary {
    background: linear-gradient(90deg,#16a34a,#059669);
    color: white;
    box-shadow: 0 6px 18px rgba(5,150,105,0.12);
  }

  .ghost {
    background: transparent;
    color: #c6d3d9;
    border: 1px solid rgba(255,255,255,0.04);
  }

  @media (max-width:700px) {
    .card { flex-direction: column; text-align:center }
    .illustration { transform: scale(0.95) }
  }
</style>
