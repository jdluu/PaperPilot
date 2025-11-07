import { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../../../shared/messaging';

type Message = {
	id: string;
	role: 'user' | 'assistant';
	content: string;
};

export function FloatingButton() {
	const [showAssistant, setShowAssistant] = useState(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState('');
	const [loading, setLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (showAssistant && inputRef.current) {
			inputRef.current.focus();
		}
	}, [showAssistant]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	async function handleSend(e: React.FormEvent) {
		e.preventDefault();
		if (!input.trim() || loading) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			role: 'user',
			content: input.trim(),
		};

		setMessages((prev) => [...prev, userMessage]);
		const query = input.trim();
		setInput('');
		setLoading(true);

		try {
			// Look up definition for the query
			const res = await sendMessage({ type: 'lookupDefinition', term: query });
			
			if (res.ok && res.type === 'lookupDefinition') {
				const definitions = res.entries;
				if (definitions.length > 0) {
					const firstEntry = definitions[0];
					const meanings = firstEntry.meanings?.slice(0, 2) || [];
					
					let responseText = `**${query}**\n\n`;
					meanings.forEach((meaning) => {
						responseText += `*${meaning.partOfSpeech}*\n`;
						meaning.definitions.slice(0, 2).forEach((def) => {
							responseText += `• ${def.definition}\n`;
							if (def.example) {
								responseText += `  Example: "${def.example}"\n`;
							}
						});
						responseText += '\n';
					});
					
					const assistantMessage: Message = {
						id: (Date.now() + 1).toString(),
						role: 'assistant',
						content: responseText.trim(),
					};
					setMessages((prev) => [...prev, assistantMessage]);
				} else {
					const assistantMessage: Message = {
						id: (Date.now() + 1).toString(),
						role: 'assistant',
						content: `I couldn't find a definition for "${query}". Try selecting a word on the page for instant definitions!`,
					};
					setMessages((prev) => [...prev, assistantMessage]);
				}
			} else {
				const assistantMessage: Message = {
					id: (Date.now() + 1).toString(),
					role: 'assistant',
					content: res.error || 'Failed to look up definition. Try selecting a word on the page instead!',
				};
				setMessages((prev) => [...prev, assistantMessage]);
			}
		} catch (err) {
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: 'assistant',
				content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setLoading(false);
		}
	}

	return (
		<>
			<button
				type="button"
				onClick={() => setShowAssistant(true)}
				style={{
					position: 'fixed',
					bottom: 24,
					left: 24,
					zIndex: 2147483646,
					width: 56,
					height: 56,
					borderRadius: '50%',
					background: '#2563eb',
					color: 'white',
					border: 'none',
					boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
					cursor: 'pointer',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontSize: 24,
					fontWeight: 600,
					transition: 'transform 0.2s, box-shadow 0.2s',
				}}
				onMouseEnter={(e) => {
					e.currentTarget.style.transform = 'scale(1.1)';
					e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.transform = 'scale(1)';
					e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
				}}
				title="Reading Assistant"
			>
				📖
			</button>
			{showAssistant && (
				<>
					<div
						style={{
							position: 'fixed',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							background: 'rgba(0,0,0,0.5)',
							zIndex: 2147483646,
						}}
						onClick={() => setShowAssistant(false)}
					/>
					<div
						style={{
							position: 'fixed',
							bottom: 24,
							right: 24,
							zIndex: 2147483647,
							width: 420,
							height: 'calc(100vh - 48px)',
							maxHeight: 600,
							background: 'white',
							borderRadius: 16,
							boxShadow: '0 12px 48px rgba(0,0,0,0.2)',
							display: 'flex',
							flexDirection: 'column',
							overflow: 'hidden',
							fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
						}}
						onClick={(e) => e.stopPropagation()}
					>
						{/* Header */}
						<div
							style={{
								padding: '20px 24px',
								borderBottom: '1px solid #e5e7eb',
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								background: '#f9fafb',
							}}
						>
							<div>
								<h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#111827' }}>
									Reading Assistant
								</h2>
								<p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
									Look up definitions and terms
								</p>
							</div>
							<button
								type="button"
								onClick={() => setShowAssistant(false)}
								style={{
									background: 'none',
									border: 'none',
									fontSize: 24,
									cursor: 'pointer',
									padding: 0,
									width: 32,
									height: 32,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									borderRadius: 6,
									color: '#6b7280',
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.background = '#e5e7eb';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background = 'none';
								}}
							>
								×
							</button>
						</div>

						{/* Messages */}
						<div
							style={{
								flex: 1,
								overflowY: 'auto',
								padding: '20px 24px',
								display: 'flex',
								flexDirection: 'column',
								gap: 16,
							}}
						>
							{messages.length === 0 && (
								<div style={{ textAlign: 'center', color: '#6b7280', marginTop: 40 }}>
									<div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
									<div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
										Reading Assistant
									</div>
									<div style={{ fontSize: 14, lineHeight: 1.6 }}>
										Ask me to define any term or word.
										<br />
										<br />
										<strong>Tip:</strong> Select text on the page for instant definitions!
									</div>
								</div>
							)}
							{messages.map((msg) => (
								<div
									key={msg.id}
									style={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
									}}
								>
									<div
										style={{
											maxWidth: '85%',
											padding: '12px 16px',
											borderRadius: 16,
											background: msg.role === 'user' ? '#2563eb' : '#f3f4f6',
											color: msg.role === 'user' ? 'white' : '#111827',
											fontSize: 14,
											lineHeight: 1.6,
											whiteSpace: 'pre-wrap',
										}}
									>
										{msg.content.split('\n').map((line, i) => {
											if (line.startsWith('**') && line.endsWith('**')) {
												return (
													<div key={i} style={{ fontWeight: 600, marginBottom: 8 }}>
														{line.replace(/\*\*/g, '')}
													</div>
												);
											}
											if (line.startsWith('*') && line.endsWith('*')) {
												return (
													<div key={i} style={{ fontStyle: 'italic', color: '#6b7280', marginTop: 8, marginBottom: 4 }}>
														{line.replace(/\*/g, '')}
													</div>
												);
											}
											if (line.startsWith('•')) {
												return (
													<div key={i} style={{ marginLeft: 8, marginBottom: 4 }}>
														{line}
													</div>
												);
											}
											if (line.startsWith('  Example:')) {
												return (
													<div key={i} style={{ marginLeft: 16, marginTop: 4, color: '#6b7280', fontSize: 13 }}>
														{line}
													</div>
												);
											}
											return <div key={i}>{line || '\u00A0'}</div>;
										})}
									</div>
								</div>
							))}
							{loading && (
								<div style={{ display: 'flex', alignItems: 'flex-start' }}>
									<div
										style={{
											padding: '12px 16px',
											borderRadius: 16,
											background: '#f3f4f6',
											color: '#6b7280',
											fontSize: 14,
										}}
									>
										Looking up...
									</div>
								</div>
							)}
							<div ref={messagesEndRef} />
						</div>

						{/* Input */}
						<div
							style={{
								padding: '16px 24px',
								borderTop: '1px solid #e5e7eb',
								background: '#f9fafb',
							}}
						>
							<form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
								<input
									ref={inputRef}
									value={input}
									onChange={(e) => setInput(e.target.value)}
									placeholder="Ask for a definition..."
									disabled={loading}
									style={{
										flex: 1,
										padding: '10px 16px',
										borderRadius: 12,
										border: '1px solid #e5e7eb',
										fontSize: 14,
										outline: 'none',
									}}
									onFocus={(e) => {
										e.currentTarget.style.borderColor = '#2563eb';
									}}
									onBlur={(e) => {
										e.currentTarget.style.borderColor = '#e5e7eb';
									}}
								/>
								<button
									type="submit"
									disabled={!input.trim() || loading}
									style={{
										padding: '10px 20px',
										borderRadius: 12,
										background: '#2563eb',
										color: 'white',
										border: 'none',
										cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
										opacity: loading || !input.trim() ? 0.5 : 1,
										fontSize: 14,
										fontWeight: 500,
									}}
								>
									Send
								</button>
							</form>
						</div>
					</div>
				</>
			)}
		</>
	);
}
