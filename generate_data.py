#!/usr/bin/env python3
import os
import json
from pathlib import Path

def scan_male_folder():
    """Scan male/component/drawable.png"""
    items = []
    male_path = Path(__file__).parent / 'male'
    
    if not male_path.exists():
        print(f"⚠ Folder 'male' not found at {male_path}")
        return items
    
    for component_dir in male_path.iterdir():
        if not component_dir.is_dir():
            continue
        
        component_id = component_dir.name
        try:
            component_id = int(component_id)
        except ValueError:
            continue
        
        for image_file in component_dir.glob('*.png'):
            drawable_id = int(image_file.stem)
            items.append({
                'component': component_id,
                'drawable': drawable_id,
                'texture': 0,
                'image': f'male/{component_id}/{drawable_id}.png',
                'name': f'male_component_{component_id}_{drawable_id}'
            })
    
    return items

def scan_ox_inventory_folder():
    """Scan ox_inventory/male_component_*.png"""
    items = []
    ox_path = Path(__file__).parent / 'ox_inventory'
    
    if not ox_path.exists():
        print(f"⚠ Folder 'ox_inventory' not found at {ox_path}")
        return items
    
    for image_file in ox_path.glob('male_component_*.png'):
        # Parse: male_component_6_312.png
        name_parts = image_file.stem.split('_')
        if len(name_parts) < 4:
            continue
        
        try:
            component_id = int(name_parts[2])
            drawable_id = int(name_parts[3])
        except (ValueError, IndexError):
            continue
        
        items.append({
            'component': component_id,
            'drawable': drawable_id,
            'texture': 0,
            'image': f'ox_inventory/{image_file.name}',
            'name': f'male_component_{component_id}_{drawable_id}'
        })
    
    return items

def main():
    male_items = scan_male_folder()
    ox_items = scan_ox_inventory_folder()
    
    # Merge và deduplicate
    merged = {}
    for item in male_items + ox_items:
        key = f"{item['component']}_{item['drawable']}"
        if key not in merged:
            merged[key] = item
    
    # Sort
    items = sorted(
        merged.values(),
        key=lambda x: (x['component'], x['drawable'])
    )
    
    data = {
        'generated': str(Path.cwd()),
        'total': len(items),
        'items': items
    }
    
    output_path = Path(__file__).parent / 'data.json'
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"✓ Generated data.json with {len(items)} items")
    if items:
        first = items[0]
        last = items[-1]
        print(f"  Range: component {first['component']}, drawable {first['drawable']} → component {last['component']}, drawable {last['drawable']}")

if __name__ == '__main__':
    main()
