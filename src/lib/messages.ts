/**
 * Mensagens do Sistema - Centralizadas e Humanizadas
 * Todas as mensagens de erro, sucesso e informação em um único lugar
 */

export const messages = {
  // Autenticação
  auth: {
    loginSuccess: {
      title: 'Bem-vindo de volta!',
      description: 'Login realizado com sucesso'
    },
    loginError: {
      title: 'Não foi possível entrar',
      description: 'Email ou senha incorretos, tente novamente'
    },
    signupSuccess: {
      title: 'Conta criada!',
      description: 'Enviamos um email de confirmação. Verifique sua caixa de entrada'
    },
    signupError: {
      title: 'Erro ao criar conta',
      description: 'Não foi possível criar sua conta. Tente novamente'
    },
    emailExists: {
      title: 'Email já cadastrado',
      description: 'Este email já está em uso. Faça login ou use outro email'
    },
    weakPassword: {
      title: 'Senha muito fraca',
      description: 'Use pelo menos 6 caracteres, misture letras, números e símbolos'
    },
    invalidEmail: {
      title: 'Email inválido',
      description: 'Digite um endereço de email válido'
    },
    sessionExpired: {
      title: 'Sessão expirada',
      description: 'Faça login novamente para continuar'
    }
  },

  // Produtos
  products: {
    created: {
      title: 'Produto adicionado!',
      description: 'Seu produto já está disponível no catálogo'
    },
    updated: {
      title: 'Produto atualizado!',
      description: 'As alterações foram salvas com sucesso'
    },
    deleted: {
      title: 'Produto removido',
      description: 'O produto foi excluído do catálogo'
    },
    createError: {
      title: 'Não foi possível adicionar',
      description: 'Erro ao criar o produto. Verifique os dados e tente novamente'
    },
    updateError: {
      title: 'Erro ao atualizar',
      description: 'Não conseguimos salvar as alterações. Tente novamente'
    },
    deleteError: {
      title: 'Erro ao remover',
      description: 'Não foi possível excluir o produto. Tente novamente'
    },
    nameRequired: {
      title: 'Nome obrigatório',
      description: 'Digite um nome para o produto'
    },
    priceRequired: {
      title: 'Preço obrigatório',
      description: 'Informe o preço do produto'
    },
    invalidPrice: {
      title: 'Preço inválido',
      description: 'Digite um valor válido maior que zero'
    },
    descriptionRequired: {
      title: 'Descrição obrigatória',
      description: 'Adicione uma descrição para o produto'
    },
    imageTooBig: {
      title: 'Imagem muito grande',
      description: 'A imagem deve ter no máximo 5MB. Escolha uma menor'
    },
    invalidImageFormat: {
      title: 'Formato não permitido',
      description: 'Use apenas imagens (JPG, PNG, WEBP ou GIF)'
    }
  },

  // Categorias
  categories: {
    created: {
      title: 'Categoria criada!',
      description: 'A categoria foi adicionada com sucesso'
    },
    updated: {
      title: 'Categoria atualizada!',
      description: 'As alterações foram salvas'
    },
    deleted: {
      title: 'Categoria removida',
      description: 'A categoria foi excluída'
    },
    createError: {
      title: 'Erro ao criar categoria',
      description: 'Não foi possível criar a categoria. Tente novamente'
    },
    updateError: {
      title: 'Erro ao atualizar',
      description: 'Não conseguimos salvar as alterações. Tente novamente'
    },
    deleteError: {
      title: 'Erro ao remover',
      description: 'Não foi possível excluir a categoria. Tente novamente'
    },
    nameRequired: {
      title: 'Nome obrigatório',
      description: 'Digite um nome para a categoria'
    },
    nameExists: {
      title: 'Nome já existe',
      description: 'Já existe uma categoria com esse nome. Escolha outro'
    },
    reorderSuccess: {
      title: 'Ordem atualizada',
      description: 'As categorias foram reordenadas'
    },
    reorderError: {
      title: 'Erro ao reordenar',
      description: 'Não foi possível salvar a nova ordem. Tente novamente'
    }
  },

  // Perfil/Configurações
  profile: {
    updated: {
      title: 'Perfil atualizado!',
      description: 'Suas alterações foram salvas'
    },
    updateError: {
      title: 'Erro ao atualizar',
      description: 'Não foi possível salvar as alterações. Tente novamente'
    },
    storeNameRequired: {
      title: 'Nome da loja obrigatório',
      description: 'Digite um nome para sua loja'
    },
    storeUrlTaken: {
      title: 'URL já está em uso',
      description: 'Essa URL já pertence a outra loja. Escolha outra'
    },
    invalidStoreUrl: {
      title: 'URL inválida',
      description: 'Use apenas letras minúsculas, números e hífens'
    },
    whatsappInvalid: {
      title: 'WhatsApp inválido',
      description: 'Digite um número de WhatsApp válido com DDD'
    },
    imageUploadError: {
      title: 'Erro no upload',
      description: 'Não foi possível enviar a imagem. Tente novamente'
    }
  },

  // Links personalizados
  customLinks: {
    created: {
      title: 'Link adicionado!',
      description: 'O link foi criado com sucesso'
    },
    updated: {
      title: 'Link atualizado!',
      description: 'As alterações foram salvas'
    },
    deleted: {
      title: 'Link removido',
      description: 'O link foi excluído'
    },
    createError: {
      title: 'Erro ao adicionar link',
      description: 'Não foi possível criar o link. Tente novamente'
    },
    titleRequired: {
      title: 'Título obrigatório',
      description: 'Digite um título para o link'
    },
    urlRequired: {
      title: 'URL obrigatória',
      description: 'Digite o endereço do link'
    },
    invalidUrl: {
      title: 'URL inválida',
      description: 'Digite uma URL válida (ex: https://exemplo.com)'
    }
  },

  // Leads
  leads: {
    captured: {
      title: 'Dados enviados!',
      description: 'Obrigado! Entraremos em contato em breve'
    },
    captureError: {
      title: 'Erro ao enviar',
      description: 'Não foi possível enviar seus dados. Tente novamente'
    },
    exported: {
      title: 'Leads exportados!',
      description: 'O arquivo foi baixado com sucesso'
    },
    exportError: {
      title: 'Erro ao exportar',
      description: 'Não foi possível exportar os leads. Tente novamente'
    },
    nameRequired: {
      title: 'Nome obrigatório',
      description: 'Por favor, digite seu nome'
    },
    phoneRequired: {
      title: 'Telefone obrigatório',
      description: 'Digite seu número de WhatsApp'
    },
    invalidPhone: {
      title: 'Telefone inválido',
      description: 'Digite um número válido com DDD (ex: 11987654321)'
    }
  },

  // Planos e assinaturas
  subscription: {
    loading: {
      title: 'Processando...',
      description: 'Estamos preparando seu checkout. Aguarde um momento'
    },
    redirecting: {
      title: 'Redirecionando...',
      description: 'Você será levado para a página de pagamento'
    },
    success: {
      title: 'Assinatura ativada!',
      description: 'Seu plano foi ativado com sucesso'
    },
    cancelled: {
      title: 'Assinatura cancelada',
      description: 'Sua assinatura foi cancelada e não renovará'
    },
    error: {
      title: 'Erro no pagamento',
      description: 'Não foi possível processar o pagamento. Tente novamente'
    },
    expired: {
      title: 'Plano expirado',
      description: 'Seu plano expirou. Renove para continuar usando todos os recursos'
    }
  },

  // Upload de arquivos
  upload: {
    success: {
      title: 'Upload concluído!',
      description: 'Arquivo enviado com sucesso'
    },
    error: {
      title: 'Erro no upload',
      description: 'Não foi possível enviar o arquivo. Tente novamente'
    },
    fileTooLarge: {
      title: 'Arquivo muito grande',
      description: 'O arquivo deve ter no máximo 5MB'
    },
    invalidFormat: {
      title: 'Formato inválido',
      description: 'Este tipo de arquivo não é permitido'
    }
  },

  // Geral
  general: {
    saved: {
      title: 'Salvo!',
      description: 'Suas alterações foram salvas'
    },
    copied: {
      title: 'Copiado!',
      description: 'Link copiado para a área de transferência'
    },
    error: {
      title: 'Algo deu errado',
      description: 'Ocorreu um erro inesperado. Tente novamente'
    },
    networkError: {
      title: 'Sem conexão',
      description: 'Verifique sua internet e tente novamente'
    },
    loading: {
      title: 'Carregando...',
      description: 'Aguarde um momento'
    },
    tryAgain: 'Tentar novamente',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    delete: 'Excluir',
    save: 'Salvar'
  }
};

// Helper para pegar mensagens facilmente
export const getErrorMessage = (error: any): { title: string; description: string } => {
  // Erros de autenticação do Supabase
  if (error?.message?.includes('Invalid login credentials')) {
    return messages.auth.loginError;
  }
  if (error?.message?.includes('User already registered')) {
    return messages.auth.emailExists;
  }
  if (error?.message?.includes('Password should be')) {
    return messages.auth.weakPassword;
  }
  if (error?.message?.includes('Invalid email')) {
    return messages.auth.invalidEmail;
  }
  
  // Erro de rede
  if (error?.message?.includes('Failed to fetch') || error?.message?.includes('Network')) {
    return messages.general.networkError;
  }

  // Erro genérico
  return {
    title: messages.general.error.title,
    description: error?.message || messages.general.error.description
  };
};
