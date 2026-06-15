import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CourseCard from './CourseCard'
import type { CourseListItem } from '../../types/course/CourseListItem'

const mockCourse: CourseListItem = {
  id: 'course-uuid-1',
  category: '한식',
  difficulty: '하',
  requiredTools: ['냄비', '도마', '칼'],
  videoCount: 5,
  price: 0,
  teacher: { id: 'teacher-1', name: '김선생' },
}

function renderCard(course = mockCourse) {
  return render(
    <MemoryRouter>
      <CourseCard course={course} />
    </MemoryRouter>,
  )
}

describe('CourseCard', () => {
  it('카테고리 이모지와 카테고리명이 표시된다', () => {
    renderCard()
    expect(screen.getByText('🍚')).toBeInTheDocument()
    expect(screen.getByText('한식')).toBeInTheDocument()
  })

  it('난이도가 표시된다', () => {
    renderCard()
    expect(screen.getByText(/난이도 하/)).toBeInTheDocument()
  })

  it('영상 수가 표시된다', () => {
    renderCard()
    expect(screen.getByText(/5강/)).toBeInTheDocument()
  })

  it('필요 도구가 최대 3개까지 표시된다', () => {
    renderCard()
    expect(screen.getByText('냄비')).toBeInTheDocument()
    expect(screen.getByText('도마')).toBeInTheDocument()
    expect(screen.getByText('칼')).toBeInTheDocument()
  })

  it('도구가 4개 이상이면 +N 뱃지가 표시된다', () => {
    const course = { ...mockCourse, requiredTools: ['냄비', '도마', '칼', '주걱', '프라이팬'] }
    renderCard(course)
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('선생님 이름이 표시된다', () => {
    renderCard()
    expect(screen.getByText(/김선생/)).toBeInTheDocument()
  })

  it('코스 상세 페이지로 연결되는 링크를 가진다', () => {
    renderCard()
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/courses/course-uuid-1')
  })
})
