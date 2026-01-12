
path = r"e:\The_Living_Desk\livingdesk-hq-main\src\components\Community.tsx"
try:
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Line 262 in file is index 261
    idx = 261
    if idx < len(lines) and "/* <Badge" in lines[idx]:
        print("Found target block.")
        # Line 263 is index 262
        # We start by simply cleaning up line 262 (index 262)
        target = "{/* {event.category} */}"
        replacement = "{event.category}"
        if target in lines[idx+1]:
            lines[idx+1] = lines[idx+1].replace(target, replacement)
            with open(path, 'w', encoding='utf-8') as f:
                f.writelines(lines)
            print("Successfully fixed the file.")
        else:
            print("Target content not found on line 263.")
            print(f"Content: {lines[idx+1]!r}")
    else:
        print("Could not find Badge comment start at line 262.")
        print(f"Content: {lines[idx]!r}")

except Exception as e:
    print(f"Error: {e}")
