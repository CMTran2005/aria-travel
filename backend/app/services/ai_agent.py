import json
from typing import Dict, Any, List
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.core.config import settings

def get_llm():
    """
    Get configured LLM with automatic fallback chain:
    1. Primary: Groq API (openai/gpt-oss-120b or qwen/qwen3.8-27b)
    2. Fallback: OpenRouter API (meta-llama/llama-3.1-8b-instruct:free)
    """
    primary_llm = None
    if settings.GROQ_API_KEY:
        try:
            # High-performance 120B reasoning model available on user's Groq tier
            primary_llm = ChatGroq(
                model="openai/gpt-oss-120b",
                temperature=0.2,
                api_key=settings.GROQ_API_KEY,
            )
        except Exception:
            pass

    if settings.OPENROUTER_API_KEY:
        fallback_llm = ChatOpenAI(
            base_url="https://openrouter.ai/api/v1",
            model="meta-llama/llama-3.1-8b-instruct:free",
            api_key=settings.OPENROUTER_API_KEY,
            temperature=0.2,
        )
        if primary_llm:
            return primary_llm.with_fallbacks([fallback_llm])
        return fallback_llm

    if not primary_llm:
        raise ValueError("No valid AI API Key found in backend/.env")

    return primary_llm

def extract_user_intent(user_input: str) -> Dict[str, Any]:
    """
    Extract structured travel intent from natural language using AI.
    """
    llm = get_llm()

    system_prompt = """Bạn là trợ lý lập kế hoạch du lịch thông minh ARIA.
Phân tích yêu cầu của người dùng và trả về DUY NHẤT một chuỗi JSON hợp lệ theo cấu trúc sau:
{
  "city": "Hội An",
  "num_days": 2,
  "budget_usd": 60,
  "travel_style": ["food", "cultural", "relaxation"],
  "group_type": "couple",
  "must_visit": [],
  "avoid": [],
  "summary": "Tóm tắt ngắn gọn mong muốn của khách"
}
Lưu ý: Chỉ trả về JSON thuần túy, không bọc trong markdown codeblock, không thêm bất kỳ văn bản giải thích nào khác."""

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=f'Yêu cầu của người dùng: "{user_input}"')
    ]

    response = llm.invoke(messages)
    raw_content = response.content.strip()

    # Clean markdown formatting if present
    if raw_content.startswith("```json"):
        raw_content = raw_content[7:]
    elif raw_content.startswith("```"):
        raw_content = raw_content[3:]
    if raw_content.endswith("```"):
        raw_content = raw_content[:-3]
    raw_content = raw_content.strip()

    try:
        return json.loads(raw_content)
    except Exception:
        # Graceful fallback
        return {
            "city": "Hội An",
            "num_days": 2,
            "budget_usd": 60,
            "travel_style": ["food", "cultural"],
            "group_type": "couple",
            "must_visit": [],
            "avoid": [],
            "summary": user_input[:120]
        }

def score_pois_with_ai(pois: List[Dict[str, Any]], intent: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Score POIs (0 to 10) based on how well they match user intent.
    """
    llm = get_llm()

    poi_summaries = [
        {
            "id": p["id"],
            "name": p["name"],
            "category": p.get("category", ""),
            "tags": p.get("tags", []),
            "avg_cost_usd": p.get("avg_cost_usd", 0),
            "rating": p.get("rating", 4.5)
        }
        for p in pois
    ]

    prompt = f"""Người dùng muốn đi du lịch {intent.get('city', 'Hội An')}.
- Phong cách mong muốn: {intent.get('travel_style', [])}
- Nhóm: {intent.get('group_type', 'solo')}
- Ngân sách: ~${intent.get('budget_usd', 50)}
- Điểm muốn ghé: {intent.get('must_visit', [])}
- Điểm muốn tránh: {intent.get('avoid', [])}

Danh sách các POI từ cơ sở dữ liệu:
{json.dumps(poi_summaries, ensure_ascii=False)}

Hãy chấm điểm từng POI từ 0.0 đến 10.0 dựa trên mức độ phù hợp và giải thích ngắn 1 câu.
Trả về DUY NHẤT một mảng JSON thuần theo mẫu:
[
  {{"id": 1, "score": 9.5, "reason": "Phù hợp với sở thích trải nghiệm ẩm thực và ngắm cảnh"}},
  ...
]
Không trả về văn bản nào khác ngoài JSON."""

    response = llm.invoke([HumanMessage(content=prompt)])
    raw_content = response.content.strip()

    if raw_content.startswith("```json"):
        raw_content = raw_content[7:]
    elif raw_content.startswith("```"):
        raw_content = raw_content[3:]
    if raw_content.endswith("```"):
        raw_content = raw_content[:-3]
    raw_content = raw_content.strip()

    try:
        scored_list = json.loads(raw_content)
        scores_map = {item["id"]: item for item in scored_list if "id" in item}
    except Exception:
        scores_map = {}

    # Merge scores back into POI objects
    results = []
    for p in pois:
        match = scores_map.get(p["id"])
        score = match.get("score", 7.0) if match else 7.0
        reason = match.get("reason", "Địa điểm nổi tiếng được nhiều du khách yêu thích") if match else "Địa điểm nổi bật"
        results.append({
            **p,
            "ai_score": score,
            "ai_reason": reason
        })

    # Sort descending by AI score
    results.sort(key=lambda x: x["ai_score"], reverse=True)
    return results
