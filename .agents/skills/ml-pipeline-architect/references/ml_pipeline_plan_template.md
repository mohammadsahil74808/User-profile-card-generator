# Reference: Sample ML Pipeline Plan Document

This reference document illustrates a complete **ML Pipeline & AI Architecture Plan** produced by the ML Pipeline Architect skill for an enterprise multimodal search system ("OmniQuery AI").

---

# ML Pipeline Plan: OmniQuery AI

## 1. System Overview & Model Tiering
- **Embedding Model**: `text-embedding-3-small` (1536 dim) for high-speed semantic retrieval.
- **Reranker**: `Cohere Rerank 3` (Top-50 candidates reranked down to Top-5).
- **Generation LLM**: Dual-tier routing:
  - Fast tier: Claude 3.5 Haiku / GPT-4o-mini (low latency simple summarization).
  - Reasoning tier: Claude 3.5 Sonnet / DeepSeek R1 (complex synthesis).
- **Vector Database**: Qdrant / pgvector with HNSW index (`m=16`, `ef_construction=64`).

## 2. Ingestion & Preprocessing Pipeline
1. **Document Parsing**: Unstructured text and PDF extraction with metadata extraction.
2. **Chunking Strategy**: Recursive character chunking (500 tokens, 10% overlap) with semantic boundary preservation.
3. **Deduplication**: MinHash LSH to reject near-duplicate documents before embedding generation.
4. **Batch Embedding**: Asynchronous batch generation with exponential backoff on 429 rate limits.

## 3. Retrieval & RAG Architecture
- **Hybrid Retrieval**: Dense Vector Search (0.7 weight) + Sparse BM25 Keyword Search (0.3 weight).
- **Context Compression**: Remove irrelevant passages before passing to LLM context window.
- **Guardrails**: Prompt injection sanitization and indirect output filter via regex and classification checks.

## 4. Observability & Evaluation
- **Tracing**: OpenTelemetry integration with Langfuse / Arize Phoenix.
- **Metrics Tracked**:
  - TTFT (Time to First Token) < 400ms.
  - End-to-end P95 Latency < 1.8s.
  - Context Relevance Score > 0.85 (Ragas metric).
  - Groundedness / Faithfulness Score > 0.90.
