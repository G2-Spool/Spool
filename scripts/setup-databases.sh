#!/bin/bash

# Complete Database Setup for Spool Platform
# Sets up RDS PostgreSQL, Neo4j, and Pinecone

set -e

echo "🗄️  Setting up Databases for Spool Platform..."
echo "============================================="

# Configuration
REGION="us-east-1"
AI_ASSISTANT_ROLE="arn:aws:iam::560281064968:role/SpoolAIAssistantRole"
EXTERNAL_ID="spool-ai-assistant-external-id"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Function to check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI not found. Please install it first."
        exit 1
    fi
    
    # Check jq for JSON parsing
    if ! command -v jq &> /dev/null; then
        log_error "jq not found. Please install it: brew install jq"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Function to setup Neo4j configuration
setup_neo4j_config() {
    log_info "Creating Neo4j configuration..."
    
    cat > neo4j-setup-config.json << EOF
{
    "neo4j_option": "managed",
    "aura_instance_name": "spool-knowledge-graph",
    "aura_size": "8GB",
    "aura_region": "us-east-1",
    "estimated_monthly_cost": 300,
    "features": [
        "Graph algorithms",
        "Full-text search",
        "Role-based access control",
        "Automatic backups"
    ],
    "use_cases": {
        "learning_paths": "Track prerequisite relationships between topics",
        "skill_mapping": "Map student skills to course requirements",
        "recommendation_engine": "Traverse graph for personalized recommendations",
        "concept_relationships": "Model complex relationships between educational concepts"
    }
}
EOF
    
    log_success "Neo4j configuration created"
}

# Function to setup Pinecone configuration
setup_pinecone_config() {
    log_info "Creating Pinecone configuration..."
    
    cat > pinecone-setup-config.json << EOF
{
    "environment": "us-east-1-aws",
    "indexes": [
        {
            "name": "spool-content-embeddings",
            "dimension": 1536,
            "metric": "cosine",
            "pods": 1,
            "replicas": 1,
            "pod_type": "p1.x1",
            "description": "Course content and learning material embeddings",
            "metadata_config": {
                "indexed": ["course_id", "topic", "difficulty", "content_type"]
            }
        },
        {
            "name": "spool-user-profiles",
            "dimension": 768,
            "metric": "euclidean",
            "pods": 1,
            "replicas": 1,
            "pod_type": "p1.x1",
            "description": "Student interest and skill profile embeddings",
            "metadata_config": {
                "indexed": ["user_id", "skill_level", "interests"]
            }
        }
    ],
    "estimated_monthly_cost": 70,
    "api_key_location": "spool/pinecone-api-key"
}
EOF
    
    log_success "Pinecone configuration created"
}

# Function to create database schema files
create_schema_files() {
    log_info "Creating database schema files..."
    
    # PostgreSQL schema
    cat > postgres-schema.sql << 'EOF'
-- Spool Platform PostgreSQL Schema

-- Users table (extends Cognito data)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cognito_sub VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_image_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty_level VARCHAR(50) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration_hours INTEGER,
    thumbnail_url TEXT,
    is_published BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Topics table
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_topic_id UUID REFERENCES topics(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Course topics junction table
CREATE TABLE course_topics (
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, topic_id)
);

-- Enrollments table
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    UNIQUE(user_id, course_id)
);

-- Learning sessions table
CREATE TABLE learning_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    activities JSONB
);

-- Interview sessions table
CREATE TABLE interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_data JSONB NOT NULL,
    interests_detected TEXT[],
    transcript TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_cognito_sub ON users(cognito_sub);
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_learning_sessions_user_id ON learning_sessions(user_id);
CREATE INDEX idx_interview_sessions_user_id ON interview_sessions(user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EOF

    # Neo4j schema (Cypher)
    cat > neo4j-schema.cypher << 'EOF'
// Spool Platform Neo4j Schema

// Create constraints
CREATE CONSTRAINT user_id IF NOT EXISTS ON (u:User) ASSERT u.id IS UNIQUE;
CREATE CONSTRAINT course_id IF NOT EXISTS ON (c:Course) ASSERT c.id IS UNIQUE;
CREATE CONSTRAINT topic_name IF NOT EXISTS ON (t:Topic) ASSERT t.name IS UNIQUE;
CREATE CONSTRAINT skill_name IF NOT EXISTS ON (s:Skill) ASSERT s.name IS UNIQUE;

// Create indexes
CREATE INDEX user_email IF NOT EXISTS FOR (u:User) ON (u.email);
CREATE INDEX course_title IF NOT EXISTS FOR (c:Course) ON (c.title);
CREATE INDEX topic_category IF NOT EXISTS FOR (t:Topic) ON (t.category);

// Example data structure
// Users
CREATE (u:User {
    id: 'user-uuid',
    email: 'student@example.com',
    skill_level: 'intermediate'
});

// Courses
CREATE (c:Course {
    id: 'course-uuid',
    title: 'Introduction to Machine Learning',
    difficulty: 'intermediate',
    duration_hours: 40
});

// Topics
CREATE (t1:Topic {name: 'Machine Learning', category: 'AI'});
CREATE (t2:Topic {name: 'Neural Networks', category: 'AI'});
CREATE (t3:Topic {name: 'Python', category: 'Programming'});

// Skills
CREATE (s1:Skill {name: 'Python Programming', level: 'advanced'});
CREATE (s2:Skill {name: 'Data Analysis', level: 'intermediate'});

// Relationships
CREATE (u)-[:ENROLLED_IN {enrolled_at: datetime(), progress: 0.25}]->(c);
CREATE (u)-[:HAS_SKILL {acquired_at: datetime(), proficiency: 0.8}]->(s1);
CREATE (c)-[:COVERS_TOPIC]->(t1);
CREATE (c)-[:COVERS_TOPIC]->(t2);
CREATE (c)-[:REQUIRES_SKILL {min_level: 'basic'}]->(s1);
CREATE (t2)-[:PREREQUISITE_OF]->(t1);
CREATE (t3)-[:RELATED_TO {strength: 0.9}]->(s1);

// Learning paths
CREATE (lp:LearningPath {
    id: 'path-uuid',
    name: 'Data Science Journey',
    estimated_duration_months: 6
});

CREATE (lp)-[:INCLUDES {order: 1}]->(c);
CREATE (u)-[:FOLLOWING {started_at: datetime()}]->(lp);
EOF

    log_success "Schema files created"
}

# Function to create service integration examples
create_integration_examples() {
    log_info "Creating integration examples..."
    
    # Python integration example
    cat > database-integration-example.py << 'EOF'
"""
Spool Platform Database Integration Example
Shows how to integrate PostgreSQL, Neo4j, and Pinecone
"""

import os
import asyncpg
from neo4j import AsyncGraphDatabase
import pinecone
from typing import List, Dict, Any
import numpy as np

class SpoolDatabaseManager:
    def __init__(self):
        self.postgres_pool = None
        self.neo4j_driver = None
        self.pinecone_index = None
        
    async def initialize(self):
        """Initialize all database connections"""
        # PostgreSQL
        self.postgres_pool = await asyncpg.create_pool(
            os.getenv('POSTGRES_CONNECTION_STRING'),
            min_size=10,
            max_size=20
        )
        
        # Neo4j
        self.neo4j_driver = AsyncGraphDatabase.driver(
            os.getenv('NEO4J_URI'),
            auth=(os.getenv('NEO4J_USER'), os.getenv('NEO4J_PASSWORD'))
        )
        
        # Pinecone
        pinecone.init(
            api_key=os.getenv('PINECONE_API_KEY'),
            environment='us-east-1-aws'
        )
        self.pinecone_index = pinecone.Index('spool-content-embeddings')
    
    async def create_user_with_graph(self, user_data: Dict[str, Any]):
        """Create user in PostgreSQL and Neo4j"""
        async with self.postgres_pool.acquire() as conn:
            # Insert into PostgreSQL
            user_id = await conn.fetchval("""
                INSERT INTO users (cognito_sub, email, first_name, last_name)
                VALUES ($1, $2, $3, $4)
                RETURNING id
            """, user_data['cognito_sub'], user_data['email'], 
                user_data['first_name'], user_data['last_name'])
            
        # Create node in Neo4j
        async with self.neo4j_driver.session() as session:
            await session.run("""
                CREATE (u:User {
                    id: $user_id,
                    email: $email,
                    created_at: datetime()
                })
            """, user_id=str(user_id), email=user_data['email'])
            
        return user_id
    
    async def find_similar_content(self, query_embedding: List[float], top_k: int = 10):
        """Find similar content using Pinecone"""
        results = self.pinecone_index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True
        )
        
        # Enrich with PostgreSQL data
        content_ids = [match['metadata']['content_id'] for match in results['matches']]
        
        async with self.postgres_pool.acquire() as conn:
            courses = await conn.fetch("""
                SELECT id, title, description, difficulty_level
                FROM courses
                WHERE id = ANY($1::uuid[])
            """, content_ids)
            
        return courses
    
    async def get_learning_path_recommendations(self, user_id: str):
        """Get personalized learning path using Neo4j graph traversal"""
        async with self.neo4j_driver.session() as session:
            result = await session.run("""
                MATCH (u:User {id: $user_id})-[:HAS_SKILL]->(s:Skill)
                MATCH (c:Course)-[:REQUIRES_SKILL]->(s)
                WHERE NOT EXISTS((u)-[:ENROLLED_IN]->(c))
                WITH c, COUNT(DISTINCT s) as matching_skills
                ORDER BY matching_skills DESC
                LIMIT 5
                MATCH (c)-[:COVERS_TOPIC]->(t:Topic)
                RETURN c.id as course_id, c.title as title, 
                       COLLECT(t.name) as topics, matching_skills
            """, user_id=user_id)
            
            return [record.data() for record in result]
    
    async def close(self):
        """Close all database connections"""
        if self.postgres_pool:
            await self.postgres_pool.close()
        if self.neo4j_driver:
            await self.neo4j_driver.close()

# Usage example
async def main():
    db_manager = SpoolDatabaseManager()
    await db_manager.initialize()
    
    # Create a new user
    user_id = await db_manager.create_user_with_graph({
        'cognito_sub': 'cognito-123',
        'email': 'student@example.com',
        'first_name': 'John',
        'last_name': 'Doe'
    })
    
    # Find similar content
    query_embedding = np.random.rand(1536).tolist()  # Example embedding
    similar_courses = await db_manager.find_similar_content(query_embedding)
    
    # Get recommendations
    recommendations = await db_manager.get_learning_path_recommendations(str(user_id))
    
    await db_manager.close()

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
EOF

    log_success "Integration examples created"
}

# Main menu function
show_menu() {
    echo ""
    echo "🗄️  Spool Database Setup Menu"
    echo "============================"
    echo "1) Setup RDS PostgreSQL"
    echo "2) Setup Neo4j Configuration"
    echo "3) Setup Pinecone Configuration"
    echo "4) Create Schema Files"
    echo "5) Create Integration Examples"
    echo "6) Setup All Databases"
    echo "7) Exit"
    echo ""
    read -p "Select an option (1-7): " choice
    
    case $choice in
        1)
            log_info "Running RDS PostgreSQL setup..."
            chmod +x setup-rds-postgres.sh
            ./setup-rds-postgres.sh
            ;;
        2)
            setup_neo4j_config
            echo ""
            log_info "Neo4j Setup Instructions:"
            echo "  1. Go to https://neo4j.com/cloud/aura/"
            echo "  2. Create a new AuraDB Professional instance"
            echo "  3. Select 8GB size in us-east-1"
            echo "  4. Save credentials in AWS Secrets Manager:"
            echo "     - Secret name: spool/neo4j/credentials"
            echo "     - Include: uri, username, password"
            ;;
        3)
            setup_pinecone_config
            echo ""
            log_info "Pinecone Setup Instructions:"
            echo "  1. Go to https://www.pinecone.io/"
            echo "  2. Create an account and new project"
            echo "  3. Create API key"
            echo "  4. Save in AWS Secrets Manager:"
            echo "     - Secret name: spool/pinecone-api-key"
            echo "  5. Create indexes using the configuration above"
            ;;
        4)
            create_schema_files
            echo ""
            log_info "Schema files created:"
            echo "  - postgres-schema.sql"
            echo "  - neo4j-schema.cypher"
            ;;
        5)
            create_integration_examples
            echo ""
            log_info "Integration example created:"
            echo "  - database-integration-example.py"
            ;;
        6)
            log_info "Setting up all databases..."
            chmod +x setup-rds-postgres.sh
            ./setup-rds-postgres.sh
            setup_neo4j_config
            setup_pinecone_config
            create_schema_files
            create_integration_examples
            log_success "All database configurations created!"
            ;;
        7)
            log_info "Exiting..."
            exit 0
            ;;
        *)
            log_error "Invalid option. Please select 1-7."
            show_menu
            ;;
    esac
}

# Main execution
main() {
    check_prerequisites
    
    while true; do
        show_menu
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run main function
main 