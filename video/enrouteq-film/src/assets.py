U = "/root/.claude/uploads/82ba93fa-67fe-5dc0-86b5-567cdd514eed/"
IMG = "/tmp/claude-0/-home-user-azamshahzadsoormo/82ba93fa-67fe-5dc0-86b5-567cdd514eed/images/"
FONT = "/tmp/claude-0/-home-user-azamshahzadsoormo/82ba93fa-67fe-5dc0-86b5-567cdd514eed/scratchpad/fonts/"
CLIP = {
 "depot":   U + "0fa74f3f-hf_20261007_141010_64b070e8-0cfa-4a01-98a1-7098453e11c9.mp4",
 "operator":U + "108904ed-hf_20261007_142953_9072e48f-4233-4c76-9741-78fb0e5277f0.mp4",
 "charger": U + "12177150-hf_20261007_161416_fbae9a10-1d5c-4f37-ba4f-65295d7eb212.mp4",
 "sim":     U + "40e854af-hf_20261007_152504_e45ad4db-4aa0-43fd-b6dc-48a004a71222.mp4",
 "cab":     U + "417b87d6-hf_20261007_173122_64f5e286-53c2-4026-a525-9962397244b9.mp4",
}
# scene -> (clip, source offset seconds, speed, local start, local end or None, ambient gain)
FOOTAGE = {
 "night":    ("depot", 0.0, 0.76, 0.0, None, 1.0),
 "operator": ("operator", 0.0, 0.72, 0.0, None, 0.9),
 "insight":  ("sim", 0.0, 0.9, 0.0, 6.2, 0.5),
 "connect":  ("cab", 0.0, 1.0, 0.0, None, 0.7),
 "travel":   ("cab", 6.64, 0.8, 0.0, None, 0.6),
 "optimiser":("charger", 0.0, 0.95, 0.0, 4.2, 0.6),
 "close":    ("depot", 6.8, 0.33, 0.0, 9.0, 0.5),
}
