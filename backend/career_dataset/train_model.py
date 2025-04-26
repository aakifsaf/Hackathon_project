import os
from transformers import AutoModelForCausalLM, AutoTokenizer, Trainer, TrainingArguments
from datasets import load_dataset
from huggingface_hub import login

# Fetch the Hugging Face token from an environment variable
hf_token = os.getenv("HUGGING_FACE_TOKEN")
if not hf_token:
    raise ValueError("Hugging Face token not found. Please set the 'HUGGING_FACE_TOKEN' environment variable.")

# Log in to Hugging Face
login(token=hf_token)

# Validate model identifier
model_name = "TinyLlama/TinyLlama-1.1B"  # Replace with a valid model identifier if needed
try:
    model = AutoModelForCausalLM.from_pretrained(model_name, use_auth_token=True)
    tokenizer = AutoTokenizer.from_pretrained(model_name, use_auth_token=True)
except OSError as e:
    print(f"Error loading model '{model_name}': {e}")
    print("Ensure the model identifier is correct and accessible.")
    raise

# Load your dataset
dataset = load_dataset("json", data_files="career_dataset/career_assessment.jsonl")["train"]

# Preprocess
def tokenize_function(example):
    inputs = tokenizer(example["input"], truncation=True, padding="max_length", max_length=512)
    outputs = tokenizer(example["output"], truncation=True, padding="max_length", max_length=512)
    inputs["labels"] = outputs["input_ids"]
    return inputs

tokenized_dataset = dataset.map(tokenize_function, batched=True)

# Train setup
training_args = TrainingArguments(
    output_dir="./career_assessment_model",
    per_device_train_batch_size=2,
    num_train_epochs=5,
    save_steps=10,
    save_total_limit=2,
    logging_steps=5,
    report_to="none",
    evaluation_strategy="no",
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset,
)

# Start fine-tuning
trainer.train()

# Save your fine-tuned model
trainer.save_model("./career_assessment_model")
