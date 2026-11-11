import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  submitMatchSchema,
} from "@bible-quiz/shared-validation";
import { isSafeAvatarValue } from "../services/auth.service";

describe("Schemas de Validação Compartilhados", () => {
  it("loginSchema deve aceitar credenciais válidas e rejeitar e-mail/senha inválidos", () => {
    const valid = loginSchema.safeParse({
      email: "teste@biblequest.com",
      password: "password123",
    });
    assert.equal(valid.success, true);

    const invalidEmail = loginSchema.safeParse({
      email: "email-invalido",
      password: "password123",
    });
    assert.equal(invalidEmail.success, false);

    const shortPassword = loginSchema.safeParse({
      email: "teste@biblequest.com",
      password: "123",
    });
    assert.equal(shortPassword.success, false);
  });

  it("registerSchema deve validar nome, e-mail e senha corretamente", () => {
    const valid = registerSchema.safeParse({
      name: "João Silva",
      email: "joao@biblequest.com",
      password: "segredo123",
    });
    assert.equal(valid.success, true);

    const shortName = registerSchema.safeParse({
      name: "Jo",
      email: "joao@biblequest.com",
      password: "segredo123",
    });
    assert.equal(shortName.success, false);
  });

  it("updateProfileSchema deve permitir campos parciais válidos e rejeitar senha curta", () => {
    const validPartial = updateProfileSchema.safeParse({
      name: "Novo Nome",
      avatar: null,
    });
    assert.equal(validPartial.success, true);

    const invalidPassword = updateProfileSchema.safeParse({
      password: "123",
    });
    assert.equal(invalidPassword.success, false);
  });

  it("submitMatchSchema deve aceitar score não negativo e rejeitar score negativo ou answers inválidas", () => {
    const valid = submitMatchSchema.safeParse({
      score: 8,
      answers: [
        {
          questionId: "550e8400-e29b-41d4-a716-446655440000",
          isCorrect: true,
        },
      ],
    });
    assert.equal(valid.success, true);

    const negativeScore = submitMatchSchema.safeParse({
      score: -1,
    });
    assert.equal(negativeScore.success, false);

    const invalidUuid = submitMatchSchema.safeParse({
      score: 1,
      answers: [
        {
          questionId: "not-a-uuid",
          isCorrect: true,
        },
      ],
    });
    assert.equal(invalidUuid.success, false);
  });

  it("isSafeAvatarValue deve aceitar URLs http(s) e Data URLs de imagem e rejeitar esquemas inseguros", () => {
    assert.equal(isSafeAvatarValue("https://example.com/avatar.png"), true);
    assert.equal(isSafeAvatarValue("http://localhost:3001/foto.jpg"), true);
    assert.equal(
      isSafeAvatarValue("data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD="),
      true,
    );
    assert.equal(
      isSafeAvatarValue("data:image/png;base64,iVBORw0KGgo="),
      true,
    );

    assert.equal(
      isSafeAvatarValue("data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="),
      false,
    );
    assert.equal(isSafeAvatarValue("javascript:alert(1)"), false);
    assert.equal(isSafeAvatarValue(""), false);
    assert.equal(isSafeAvatarValue("not-a-valid-url"), false);
  });
});
