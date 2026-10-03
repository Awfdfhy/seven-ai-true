#!/usr/bin/env python3
import os
from pydantic import SecretStr
from openhands.sdk import LLM, Conversation
from openhands.tools.preset.default import get_default_agent

prompt_path=os.environ["SEVEN_AGENT_PROMPT"]
workspace=os.getcwd()
prompt=open(prompt_path,encoding="utf-8").read()

llm=LLM(
    model=os.environ.get("LLM_MODEL","openai/kilo-auto/free"),
    api_key=SecretStr(os.environ.get("LLM_API_KEY","local-dummy-key")),
    base_url=os.environ.get("LLM_BASE_URL"),
    usage_id="seven-live-smoke",
    drop_params=True,
)
agent=get_default_agent(llm=llm,cli_mode=True)
conversation=Conversation(agent=agent,workspace=workspace)
conversation.send_message(prompt)
conversation.run()
