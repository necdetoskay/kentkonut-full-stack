const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3021';

async function getMediaCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/media-categories`);
        if (!response.ok) {
            console.error('Failed to fetch media categories:', response.statusText);
            return null;
        }
        const data = await response.json();
        return data.categories;
    } catch (error) {
        console.error('Error fetching media categories:', error);
        return null;
    }
}

async function getAllProjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/projects?limit=500`);
        if (!response.ok) {
            console.error('Failed to fetch projects:', response.statusText);
            return [];
        }
        const data = await response.json();
        return data.projects;
    } catch (error) {
        console.error('Error fetching projects:', error);
        return [];
    }
}

async function createMediaForProject(project, categoryId) {
    const imageUrl = `https://picsum.photos/seed/${project.id}/800/600`;
    const formData = new URLSearchParams();
    formData.append('embedUrl', imageUrl);
    formData.append('alt', `${project.title} - Ana Görsel`);
    if (categoryId) {
        formData.append('categoryId', categoryId);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/media`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            console.error(`Failed to create media for project ${project.id}:`, response.statusText);
            const errorBody = await response.text();
            console.error('Error body:', errorBody);
            return null;
        }
        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error(`Error creating media for project ${project.id}:`, error);
        return null;
    }
}

async function updateProject(projectId, mediaId, projectData) {
    // Transform tags from array of objects to array of strings
    const transformedTags = projectData.tags ? projectData.tags.map(t => t.tag.name) : [];
    const transformedGallery = projectData.galleryItems ? projectData.galleryItems.map(g => g.mediaId) : [];

    const updateData = { 
        ...projectData, 
        mediaId: mediaId,
        tags: transformedTags,
        galleryItems: transformedGallery
    };

    // Remove fields that are not part of the update schema or are relations
    delete updateData.author;
    delete updateData.media;
    delete updateData.quickAccessLinks;
    delete updateData._count;
    delete updateData.comments;
    delete updateData.relatedProjects;
    delete updateData.relatedToProjects;

    try {
        const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
        });

        if (!response.ok) {
            console.error(`Failed to update project ${projectId}:`, response.statusText);
            const errorBody = await response.text();
            console.error('Error body:', errorBody);
            return false;
        }
        return true;
    } catch (error) {
        console.error(`Error updating project ${projectId}:`, error);
        return false;
    }
}

async function main() {
    console.log('Starting project image update process...');

    const categories = await getMediaCategories();
    let generalCategoryId = null;
    if (categories && categories.length > 0) {
        const generalCategory = categories.find(c => c.name === 'Projeler');
        generalCategoryId = generalCategory ? generalCategory.id : categories[0].id;
        console.log(`Using media category ID: ${generalCategoryId}`);
    } else {
        console.warn('Could not find any media categories. Proceeding without category.');
    }

    const projects = await getAllProjects();
    if (projects.length === 0) {
        console.log('No projects found to update.');
        return;
    }

    console.log(`Found ${projects.length} projects. Starting update...`);

    for (const project of projects) {
        console.log(`
Processing project: ${project.id} - ${project.title}`);

        const newMedia = await createMediaForProject(project, generalCategoryId);

        if (newMedia && newMedia.id) {
            console.log(`  -> Created new media record with ID: ${newMedia.id}`);
            const success = await updateProject(project.id, newMedia.id, project);
            if (success) {
                console.log(`  -> Successfully updated project ${project.id} to use new media ID.`);
            } else {
                console.error(`  -> FAILED to update project ${project.id}.`);
            }
        } else {
            console.error(`  -> FAILED to create media for project ${project.id}.`);
        }
    }

    console.log('\nProcess completed.');
}

main();
