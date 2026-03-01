<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { PanelId } from '$lib/config';

	interface Props {
		id: PanelId;
		title: string;
		count?: number | string | null;
		status?: string;
		statusClass?: string;
		loading?: boolean;
		error?: string | null;
		draggable?: boolean;
		collapsible?: boolean;
		collapsed?: boolean;
		onCollapse?: () => void;
		header?: Snippet;
		actions?: Snippet;
		children: Snippet;
	}

	let {
		id,
		title,
		count = null,
		status = '',
		statusClass = '',
		loading = false,
		error = null,
		draggable = true,
		collapsible = false,
		collapsed = false,
		onCollapse,
		header,
		actions,
		children
	}: Props = $props();

	function handleCollapse() {
		if (collapsible && onCollapse) {
			onCollapse();
		}
	}
</script>

<div class="panel" class:draggable class:collapsed data-panel-id={id}>
	<div class="panel-header">
		<div class="panel-title-row">
			<span class="panel-indicator"></span>
			<h3 class="panel-title">{title}</h3>
			{#if count !== null}
				<span class="panel-count">{count}</span>
			{/if}
			{#if status}
				<span class="panel-status {statusClass}">{status}</span>
			{/if}
			{#if loading}
				<span class="panel-loading"></span>
			{/if}
		</div>

		{#if header}
			{@render header()}
		{/if}

		<div class="panel-actions">
			{#if actions}
				{@render actions()}
			{/if}
			{#if collapsible}
				<button class="panel-collapse-btn" onclick={handleCollapse} aria-label="Toggle panel">
					{collapsed ? '▼' : '▲'}
				</button>
			{/if}
		</div>
	</div>

	<div class="panel-content" class:hidden={collapsed}>
		{#if error}
			<div class="error-msg">{error}</div>
		{:else if loading}
			<div class="loading-msg">
				<span class="loading-spinner"></span>
				Scanning...
			</div>
		{:else}
			{@render children()}
		{/if}
	</div>
</div>

<style>
	.panel {
		background: var(--surface);
		border: 1px solid var(--border);
		border-left: 2px solid var(--green);
		border-radius: 0 3px 3px 0;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		transition: border-color 0.3s ease;
	}

	.panel:hover {
		border-left-color: var(--cyan);
	}

	.panel.draggable {
		cursor: grab;
	}

	.panel.draggable:active {
		cursor: grabbing;
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.45rem 0.75rem;
		background: linear-gradient(90deg, rgba(0, 255, 127, 0.03) 0%, transparent 50%);
		border-bottom: 1px solid var(--border);
		min-height: 2rem;
	}

	.panel-title-row {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.panel-indicator {
		width: 4px;
		height: 4px;
		background: var(--green);
		border-radius: 50%;
		opacity: 0.6;
	}

	.panel-title {
		font-size: 0.6rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-dim);
		margin: 0;
	}

	.panel-count {
		font-size: 0.55rem;
		font-weight: 500;
		color: var(--cyan);
		padding: 0.1rem 0.35rem;
		border-radius: 2px;
		border: 1px solid rgba(0, 204, 238, 0.2);
	}

	.panel-status {
		font-size: 0.5rem;
		font-weight: 600;
		padding: 0.1rem 0.4rem;
		border-radius: 2px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.panel-status.monitoring {
		color: var(--text-muted);
		border: 1px solid var(--border);
	}

	.panel-status.elevated {
		color: var(--yellow);
		border: 1px solid rgba(255, 196, 0, 0.3);
	}

	.panel-status.critical {
		color: var(--red);
		border: 1px solid rgba(255, 45, 45, 0.3);
		animation: pulse-dot 2s ease-in-out infinite;
	}

	@keyframes pulse-dot {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	.panel-loading {
		width: 10px;
		height: 10px;
		border: 1.5px solid var(--border);
		border-top-color: var(--green);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.panel-actions {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.panel-collapse-btn {
		background: none;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		padding: 0.25rem;
		font-size: 0.5rem;
		line-height: 1;
	}

	.panel-collapse-btn:hover {
		color: var(--text);
	}

	.panel-content {
		flex: 1;
		overflow-y: auto;
		padding: 0.5rem;
	}

	.panel-content.hidden {
		display: none;
	}

	.error-msg {
		color: var(--red);
		text-align: center;
		padding: 1rem;
		font-size: 0.65rem;
	}

	.loading-msg {
		color: var(--text-muted);
		text-align: center;
		padding: 1rem;
		font-size: 0.6rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.loading-spinner {
		width: 10px;
		height: 10px;
		border: 1.5px solid var(--border);
		border-top-color: var(--green);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		display: inline-block;
	}
</style>
